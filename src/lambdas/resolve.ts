import type { CloudFrontRequestEvent, CloudFrontRequestResult } from 'aws-lambda';

export async function handler(event: CloudFrontRequestEvent): Promise<CloudFrontRequestResult> {
  const request = event.Records[0].cf.request;
  console.log('old uri', request.uri);
  request.uri = request.uri.replace(/\/$/, '/index.html');
  console.log('new uri', request.uri);

  return request;
}
