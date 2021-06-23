import type { CloudFrontRequestEvent, CloudFrontRequestResult } from 'aws-lambda';

export async function handler(event: CloudFrontRequestEvent): Promise<CloudFrontRequestResult> {
  const request = event.Records[0].cf.request;
  const url = new URL(request.uri);

  if (url.pathname.split('/').slice(-1)[0]?.split('.').length < 2) {
    url.pathname = `${url.pathname.replace(/\/$/, '')}/index.html`;
  }
  request.uri = url.href;
  console.log('new uri', request.uri);
  return request;
}
