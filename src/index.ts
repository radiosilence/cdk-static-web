import {
  aws_certificatemanager as acm,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as cforigins,
  aws_iam as iam,
  aws_lambda as lambda,
  aws_route53 as route53,
  aws_route53_targets as r53targets,
  aws_s3 as s3,
  aws_s3_deployment as s3deploy,
  StackProps,
} from 'aws-cdk-lib';
import { BucketDeploymentProps } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import path from 'path';

import { NodejsEdgeFunction } from './lambda-edge-nodejs/index.ts';

export interface StaticWebProps extends StackProps {
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
   * Default nested indexes (requires edge lambda)
   */
  readonly defaultIndexes?: boolean;

  /**
   * ACM certificate
   */
  readonly certificate?: acm.ICertificate;

  /**
   * List of subdomains, use `null` for root domain
   */
  readonly recordNames?: (string | null)[];

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
   * Whether to skip deployment and only create infra.
   */
  readonly skipDeployment?: boolean;

  /**
   * Additional props to pass to S3 deployment
   */
  readonly deploymentProps?: Partial<BucketDeploymentProps>;

  /**
   * Additional props to pass to CloudFront distribution
   */
  readonly behaviourOptions?: Partial<cloudfront.BehaviorOptions>;

  /**
   *  Error page template. Example '/{CODE}.html'
   */
  readonly errorPagePath?: string;
}

export class StaticWeb extends Construct {
  readonly bucket: s3.IBucket;
  readonly distribution: cloudfront.IDistribution;
  readonly aRecords?: route53.ARecord[];
  readonly aaaaRecords?: route53.AaaaRecord[];
  readonly deployment?: s3deploy.BucketDeployment;
  readonly originAccessIdentity?: cloudfront.OriginAccessIdentity;

  constructor(scope: Construct, id: string, props: StaticWebProps) {
    super(scope, id);

    this.originAccessIdentity = this.createOriginAccessIdentity();
    this.bucket = props.bucket ?? this.createBucket();
    this.distribution = this.createDistribution(this.bucket, this.originAccessIdentity, props);
    const statement = this.createIAMStatement(this.bucket, this.originAccessIdentity);
    this.bucket.addToResourcePolicy(statement);
    this.aRecords = this.createARecords(props, this.distribution);
    this.aaaaRecords = this.createAaaaRecords(props, this.distribution);
    if (!props.skipDeployment) {
      this.deployment = this.createDeployment(this.bucket, props, this.distribution);
    }
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

  private createRequestLambda() {
    return new NodejsEdgeFunction(this, 'RequestLambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'handler',
      memorySize: 128,
      entry: path.join(__dirname, 'lambdas', 'request', 'index.js'),
    });
  }

  private createResponseLambda() {
    return new NodejsEdgeFunction(this, 'ResponseLambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'handler',
      memorySize: 128,
      entry: path.join(__dirname, 'lambdas', 'response', 'index.js'),
    });
  }

  private createDistribution(
    bucket: s3.IBucket,
    originAccessIdentity: cloudfront.OriginAccessIdentity,
    props: StaticWebProps,
  ) {
    const errorResponses: cloudfront.ErrorResponse[] = [];
    const {
      distributionProps,
      behaviourOptions,
      isSPA,
      certificate,
      recordNames,
      zone,
      errorPagePath,
      defaultIndexes,
    } = props;
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
    } else if (errorPagePath) {
      errorResponses.push({
        httpStatus: 404,
        responseHttpStatus: 200,
        responsePagePath: errorPagePath.replace('{CODE}', '404'),
      });

      errorResponses.push({
        httpStatus: 403,
        responseHttpStatus: 200,
        responsePagePath: errorPagePath.replace('{CODE}', '403'),
      });
    }

    const edgeLambdas: cloudfront.EdgeLambda[] = [];

    if (defaultIndexes) {
      edgeLambdas.push({
        eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
        functionVersion: this.createRequestLambda().currentVersion,
      });
      edgeLambdas.push({
        eventType: cloudfront.LambdaEdgeEventType.ORIGIN_RESPONSE,
        functionVersion: this.createResponseLambda().currentVersion,
      });
    }

    const zoneName = zone?.zoneName;
    const domainNames =
      zoneName && recordNames
        ? recordNames.map((recordName) => (recordName === null ? zoneName : `${recordName}.${zoneName}`))
        : undefined;

    return new cloudfront.Distribution(this, `Distribution`, {
      defaultBehavior: {
        origin: new cforigins.S3Origin(bucket, {
          originAccessIdentity,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        edgeLambdas,
        ...behaviourOptions,
      },
      domainNames,
      defaultRootObject: 'index.html',
      errorResponses,
      certificate,
      ...distributionProps,
    });
  }

  private createOriginAccessIdentity() {
    return new cloudfront.OriginAccessIdentity(this, `OriginAccessIdentity`);
  }

  /* eslint-disable */
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

  private createARecords({ recordNames, zone }: StaticWebProps, distribution: cloudfront.IDistribution) {
    if (zone && recordNames) {
      return recordNames.map(
        (recordName) =>
          new route53.ARecord(this, `ARecord-${recordName ?? '@'}`, {
            zone,
            recordName: recordName ?? undefined,
            target: route53.RecordTarget.fromAlias(new r53targets.CloudFrontTarget(distribution)),
          }),
      );
    } else {
      return [];
    }
  }

  private createAaaaRecords({ recordNames, zone }: StaticWebProps, distribution: cloudfront.IDistribution) {
    if (zone && recordNames) {
      return recordNames.map(
        (recordName) =>
          new route53.AaaaRecord(this, `AAAARecord-${recordName ?? '@'}`, {
            zone,
            recordName: recordName ?? undefined,
            target: route53.RecordTarget.fromAlias(new r53targets.CloudFrontTarget(distribution)),
          }),
      );
    } else {
      return;
    }
  }
}
