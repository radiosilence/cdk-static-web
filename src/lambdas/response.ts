import type { CloudFrontResponseEvent, CloudFrontResponseResult } from 'aws-lambda';

export async function handler(event: CloudFrontResponseEvent): Promise<CloudFrontResponseResult> {
  console.log('event', event);
  const { request } = event.Records[0].cf;

  return {
    status: '200',
    statusDescription: 'OK',
    headers: {
      'content-type': [
        {
          key: 'Content-Type',
          value: 'application/json',
        },
      ],
    },
    body: JSON.stringify(request, null, 2),
  };
}
