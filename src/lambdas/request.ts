import type { CloudFrontRequestEvent, CloudFrontRequestResult } from 'aws-lambda';
import * as path from 'path';

export async function handler(event: CloudFrontRequestEvent): Promise<CloudFrontRequestResult> {
  try {
    const request = event.Records[0].cf.request;
    const extension = path.extname(request.uri);

    request.headers['x-original-uri'] = [{ key: 'x-original-uri', value: request.uri }];

    if (!extension) {
      request.headers['x-rewritten'] = [{ key: 'x-rewritten', value: 'true' }];
      request.uri = `${request.uri.replace(/\/$/, '')}/index.html`;

      console.log('rewritten:', request.uri);
    }

    return request;
  } catch (err) {
    return {
      status: '500',
      statusDescription: 'Internal Server Error',
      body: `${err}`,
    };
  }
}
