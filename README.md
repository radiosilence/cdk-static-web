# cdk-static-web

Simple, injectable construct to host a static website. The AWS examples and other packages seemed to use deprecated stuff so I figured I'd roll my own.

## Features

* Origin Access Identities
* Optional index path rewriting and redirection (`/potato` will rewrite to `/potato/index.html` and also redirect to `/potato/`).

## Example

```ts
import * as acm from "@aws-cdk/aws-certificatemanager";
import { PriceClass } from "@aws-cdk/aws-cloudfront";
import * as route53 from "@aws-cdk/aws-route53";
import * as cdk from "@aws-cdk/core";
import { StaticWeb } from "cdk-static-web";

interface Props extends cdk.StackProps {
  domainName: string;
}

export class ExampleWebStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id, props);
    const { domainName } = props;

    const zone = route53.PublicHostedZone.fromLookup(this, "ExampleZone", {
      domainName,
    });

    const certificate = new acm.DnsValidatedCertificate(this, "ExampleWebCert", {
      domainName,
      hostedZone: zone,
      region: "us-east-1",
    });

    new StaticWeb(this, "Example", {
      zone,
      certificate,
      isSPA: true, // This will make error documents 200 to index.html
      staticPath: "./public",
      distributionProps: {
        priceClass: PriceClass.PRICE_CLASS_100,
      },
    });
  }
}
```

## API Reference

See [API.md](API.md).

## License

[MIT](LICENCE)