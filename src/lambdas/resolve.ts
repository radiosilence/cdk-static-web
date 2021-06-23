import type { CloudFrontRequestCallback, CloudFrontRequestEvent, Context } from 'aws-lambda';

function handler(event: CloudFrontRequestEvent, _: Context, callback: CloudFrontRequestCallback) {
  const request = event.Records[0].cf.request;

  if (request.uri.split('/').slice(-1)[0]?.split('.').length < 2) {
    request.uri = `${request.uri.replace(/\/$/, '')}/index.html`;
    console.log('update uri to', request.uri);
  }

  callback(null, request);
}

exports.handler = handler;
