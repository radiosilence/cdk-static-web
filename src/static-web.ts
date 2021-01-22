import * as path from 'path';
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import { Construct } from '@aws-cdk/core';

export interface StaticWebProps {
  readonly environment?: Record<string, string>;
}

export class StaticWeb extends Construct {
  constructor(scope: Construct, id: string, props: StaticWebProps = {}) {
    super(scope, id);

    new Function(this, 'DemoFunction', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: Code.fromAsset(path.join(__dirname, 'lambdas', 'demo')),
      environment: props.environment,
    });
  }
}
