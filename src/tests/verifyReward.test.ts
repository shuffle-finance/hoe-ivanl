// src/tests/verifyReward.test.ts

import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../functions/verifyReward';

// Helper to create mock API Gateway events
const createMockEvent = (
  headers: Record<string, string> = {}, 
  queryStringParameters: Record<string, string> | null = null
): APIGatewayProxyEvent => {
  return {
    headers,
    queryStringParameters,
    multiValueHeaders: {},
    multiValueQueryStringParameters: {},
    pathParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: '',
    httpMethod: 'GET',
    path: '',
    isBase64Encoded: false,
    body: null
  };
};

describe('Verify Reward Lambda Function', () => {
  test('Should return 400 when no transaction ID is provided', async () => {
    const mock: APIGatewayProxyEvent = createMockEvent({},null)
    const response: APIGatewayProxyEvent = await handler(mock)
    expect(response.status).toBe(400);
  });

  test('Should return 401 when no API key is provided', async () => {
    const mock: APIGatewayProxyEvent = createMockEvent({},null)
    const response: APIGatewayProxyEvent = await handler(mock)
    expect(response.status).toBe(401);
  });

  test('Should return 403 when API key is invalid', async () => {
    const mock: APIGatewayProxyEvent = createMockEvent({},null)
    const response: APIGatewayProxyEvent = await handler(mock)
    expect(response.body.message).toBe('Authorization does not match merchant');
    expect(response.status).toBe(403);
  });

  test('Should return 404 when no transaction is found', async () => {
    const mock: APIGatewayProxyEvent = createMockEvent({},null)
    const response: APIGatewayProxyEvent = await handler(mock)
    expect(response.status).toBe(404);
  });

  test('Should return 403 when merchant does not own the transaction', async () => {
    const mock: APIGatewayProxyEvent = createMockEvent({},null)
    const response: APIGatewayProxyEvent = await handler(mock)
    expect(response.body.message).toBe('Transaction does not match merchant');
    expect(response.status).toBe(403);
  });

  test('Should return reward details for valid request', async () => {
    const mock: APIGatewayProxyEvent = createMockEvent({},null)
    const response: APIGatewayProxyEvent = await handler(mock)
    expect(response.body).toContain('id')
    expect(response.status).toBe(200);
  });
});
