import type { CloudFrontResponseEvent, CloudFrontResponseResult } from 'aws-lambda';
import * as path from 'path';
export async function handler(event: CloudFrontResponseEvent): Promise<CloudFrontResponseResult> {
  console.log('event', event);
  const { request, response } = event.Records[0].cf;
  const extension = path.extname(request.uri);

  const rewritten = request.headers['x-rewritten'];

  if (rewritten) {
    const { uri } = request;
    const value = uri.replace('index.html', '');
    console.log('nextUri', value);

    const originalUri = request.headers['x-original-uri'][0].value;

    if (!originalUri.endsWith('/')) {
      return {
        status: '302',
        statusDescription: 'Found',
        headers: {
          location: [
            {
              key: 'Location',
              value,
            },
          ],
        },
      };
    }
  }

  return response;
}
