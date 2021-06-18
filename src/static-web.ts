import * as acm from '@aws-cdk/aws-certificatemanager';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import * as iam from '@aws-cdk/aws-iam';
import * as route53 from '@aws-cdk/aws-route53';
import * as alias from '@aws-cdk/aws-route53-targets';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as cdk from '@aws-cdk/core';

export interface StaticWebProps {
  readonly environment?: Record<string, string>;

  /**
   * Path to static files
   */
  readonly staticPath: string;

  /**
   * Whether to resolve 404 errors to index.html with 200
   */
  readonly isSPA?: boolean;

  /**
   * ACM certificate
   */
  readonly certificate?: acm.ICertificate;

  /**
   * The name of your A record, if you're using a subdomain
   */
  readonly recordName?: string;

  /**
   * Route 53 zone
   */
  readonly zone?: route53.IHostedZone;

  /**
   * S3 bucket
   */
  readonly bucket?: s3.IBucket;

  /**
   * Additional props to pass to CloudFront distribution
   */
  readonly distributionProps?: Partial<cloudfront.DistributionProps>;

  /**
   * Additional props to pass to S3 deployment
   */
  readonly deploymentProps?: Partial<s3deploy.BucketDeploymentProps>;

  /**
   * Additional props to pass to CloudFront distribution
   */
  readonly behaviourOptions?: Partial<cloudfront.BehaviorOptions>;
}

export class StaticWeb extends cdk.Construct {
  readonly bucket: s3.IBucket;
  readonly distribution: cloudfront.IDistribution;
  readonly aRecord?: route53.ARecord;
  readonly aaaaRecord?: route53.AaaaRecord;
  readonly deployment?: s3deploy.BucketDeployment;
  readonly originAccessIdentity?: cloudfront.OriginAccessIdentity;

  constructor(scope: cdk.Construct, id: string, props: StaticWebProps) {
    super(scope, id);
    this.originAccessIdentity = this.createOriginAccessIdentity();
    this.bucket = props.bucket ?? this.createBucket();
    this.distribution = this.createDistribution(this.bucket, this.originAccessIdentity, props);
    const statement = this.createIAMStatement(this.bucket, this.originAccessIdentity);
    this.bucket.addToResourcePolicy(statement);
    this.deployment = this.createDeployment(this.bucket, props, this.distribution);
    this.aRecord = this.createARecord(props, this.distribution);
    this.aaaaRecord = this.createAaaaRecord(props, this.distribution);
  }

  private createBucket(): s3.Bucket {
    return new s3.Bucket(this, `Bucket`, {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });
  }

  private createIAMStatement(bucket: s3.IBucket, originAccessIdentity: cloudfront.OriginAccessIdentity) {
    const statement = new iam.PolicyStatement();

    statement.addActions('s3:GetBucket*', 's3:GetObject*', 's3:List*');
    statement.addResources(bucket.bucketArn, `${bucket.bucketArn}/*`);
    statement.addCanonicalUserPrincipal(originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId);

    return statement;
  }

  private createDistribution(
    bucket: s3.IBucket,
    originAccessIdentity: cloudfront.OriginAccessIdentity,
    { distributionProps, behaviourOptions, isSPA, certificate, recordName, zone }: StaticWebProps,
  ) {
    const errorResponses = [];

    if (isSPA) {
      errorResponses.push({
        httpStatus: 404,
        responseHttpStatus: 200,
        responsePagePath: '/index.html',
      });

      errorResponses.push({
        httpStatus: 403,
        responseHttpStatus: 200,
        responsePagePath: '/index.html',
      });
    }

    const zoneName = zone?.zoneName;
    const domainName = recordName && zoneName ? `${recordName}.${zoneName}` : zoneName;

    return new cloudfront.Distribution(this, `Distribution`, {
      defaultBehavior: {
        origin: new origins.S3Origin(bucket, {
          originAccessIdentity,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        ...behaviourOptions,
      },
      domainNames: domainName ? [domainName] : [],
      defaultRootObject: 'index.html',
      errorResponses,
      certificate,
      ...distributionProps,
    });
  }

  private createOriginAccessIdentity() {
    return new cloudfront.OriginAccessIdentity(this, `OriginAccessIdentity`);
  }

  private createDeployment(
    destinationBucket: s3.IBucket,
    { staticPath, deploymentProps }: StaticWebProps,
    distribution: cloudfront.IDistribution,
  ) {
    return new s3deploy.BucketDeployment(this, `Deployment`, {
      sources: [s3deploy.Source.asset(staticPath)],
      destinationBucket,
      distribution,
      ...deploymentProps,
    });
  }

  private createARecord({ recordName, zone }: StaticWebProps, distribution: cloudfront.IDistribution) {
    if (zone) {
      return new route53.ARecord(this, `ARecord`, {
        zone,
        recordName,
        target: route53.RecordTarget.fromAlias(new alias.CloudFrontTarget(distribution)),
      });
    } else {
      return;
    }
  }

  private createAaaaRecord({ recordName, zone }: StaticWebProps, distribution: cloudfront.IDistribution) {
    if (zone) {
      return new route53.AaaaRecord(this, `AAAARecord`, {
        zone,
        recordName,
        target: route53.RecordTarget.fromAlias(new alias.CloudFrontTarget(distribution)),
      });
    } else {
      return;
    }
  }
}
