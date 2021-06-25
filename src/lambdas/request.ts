import type { CloudFrontRequestEvent, CloudFrontRequestResult } from 'aws-lambda';
import * as path from 'path';

export async function handler(event: CloudFrontRequestEvent): Promise<CloudFrontRequestResult> {
  const request = event.Records[0].cf.request;
  const extension = path.extname(request.uri);

  request.headers['x-original-uri'] = [{ key: 'x-original-uri', value: request.uri }];

  if (!extension) {
    request.headers['x-rewritten'] = [{ key: 'x-rewritten', value: 'true' }];
    request.uri = `${request.uri.replace(/\/$/, '')}/index.html`;

    console.log('updated uri to', request.uri);
  }

  return request;
}
