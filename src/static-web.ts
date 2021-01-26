import * as acm from '@aws-cdk/aws-certificatemanager';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
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
  readonly distribution: cloudfront.Distribution;
  readonly record?: route53.ARecord;
  readonly deployment?: s3deploy.BucketDeployment;

  constructor(scope: cdk.Construct, id: string, props: StaticWebProps) {
    super(scope, id);
    const { zone, certificate } = props;

    this.bucket = props.bucket ?? this.createBucket();
    this.distribution = this.createDistribution(this.bucket, props, zone?.zoneName, certificate);
    this.deployment = this.createDeployment(this.bucket, props, this.distribution);

    if (zone) {
      this.record = this.createARecord(zone, this.distribution);
    }
  }

  private createBucket(): s3.Bucket {
    return new s3.Bucket(this, `Bucket`);
  }

  private createDistribution(
    bucket: s3.IBucket,
    { distributionProps, behaviourOptions, isSPA }: StaticWebProps,
    zoneName: string | undefined,
    certificate: acm.ICertificate | undefined,
  ) {
    const errorResponses = [];

    if (isSPA) {
      errorResponses.push({
        httpStatus: 404,
        responseHttpStatus: 200,
        responsePagePath: '/index.html',
      });
    }

    return new cloudfront.Distribution(this, `Distribution`, {
      defaultBehavior: {
        origin: new origins.S3Origin(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        ...behaviourOptions,
      },
      domainNames: zoneName ? [zoneName] : [],
      defaultRootObject: 'index.html',
      errorResponses,
      certificate,
      ...distributionProps,
    });
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

  private createARecord(zone: route53.IHostedZone, distribution: cloudfront.IDistribution) {
    return new route53.ARecord(this, `ARecord`, {
      zone,
      target: route53.RecordTarget.fromAlias(new alias.CloudFrontTarget(distribution)),
    });
  }
}
