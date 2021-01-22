import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import { Stack } from '@aws-cdk/core';
import { StaticWeb } from '../static-web';

test('default setup', () => {
  // GIVEN
  const stack = new Stack();

  // WHEN
  new StaticWeb(stack, 'StaticWeb', {
    staticPath: '.',
  });

  // THEN
  expectCDK(stack).to(haveResource('AWS::Lambda::Function'));
});
