import type { CloudFrontRequestEvent, CloudFrontRequestResult } from 'aws-lambda';
import * as path from 'path';

export async function handler(event: CloudFrontRequestEvent): Promise<CloudFrontRequestResult> {
  const request = event.Records[0].cf.request;
  const extension = path.extname(request.uri);

  if (!extension) {
    request.uri = `${request.uri.replace(/\/$/, '')}/index.html`;
    console.log('updated uri to', request.uri);
  }

  return request;
}
