import type { CloudFrontResponseEvent, CloudFrontResponseResult } from 'aws-lambda';
export async function handler(event: CloudFrontResponseEvent): Promise<CloudFrontResponseResult> {
  try {
    console.log('event', event);
    const { request, response } = event.Records[0].cf;

    const rewritten = request.headers['x-rewritten'];
    const originalUri = request.headers['x-original-uri']?.[0]?.value;

    if (rewritten) {
      const { uri, querystring } = request;
      let value = uri.replace('index.html', '');

      if (request.querystring) {
        value += `?${querystring}`;
      }

      console.log('redirecting to', value);

      if (!originalUri.endsWith('/')) {
        return {
          status: '302',
          statusDescription: 'Found',
          headers: {
            location: [{ key: 'Location', value }],
            'content-type': [{ key: 'Content-Type', value: 'application/json' }],
          },
          body: JSON.stringify({ request, response, originalUri }),
        };
      }
    }

    return response;
  } catch (err) {
    return {
      status: '500',
      statusDescription: 'Internal Server Error',
      body: `${err}`,
    };
  }
}
