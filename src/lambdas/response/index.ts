import type { CloudFrontResponseEvent, CloudFrontResponseResult } from 'aws-lambda';
export async function handler(event: CloudFrontResponseEvent): Promise<CloudFrontResponseResult> {
  try {
    console.log('event', event);
    const { request, response } = event.Records[0].cf;

    if (Number(response.status) >= 400) return response;

    const rewritten = request.headers['x-rewritten'];
    const originalUri = request.headers['x-original-uri']?.[0]?.value;

    if (rewritten) {
      const { uri, querystring } = request;
      let value = uri.replace('index.html', '');

      if (request.querystring) {
        value += `?${querystring}`;
      }

      console.log('redirect:', value);

      if (!originalUri.endsWith('/')) {
        return {
          status: '302',
          statusDescription: 'Found',
          headers: {
            location: [{ key: 'Location', value }],
          },
          body: '',
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
