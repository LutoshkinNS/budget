import fastify from 'fastify';
import { describe, expect, it } from 'vitest';

import CategoryAlreadyExistsError from '#s/CategoryAlreadyExistsError.js';
import InternalServerError from '#s/InternalServerError.js';
import PayloadTooLargeError from '#s/PayloadTooLargeError.js';
import UnsupportedMediaTypeError from '#s/UnsupportedMediaTypeError.js';
import ValidationError from '#s/ValidationError.js';

import errorHandlerPlugin from '../error-handler-plugin.js';

const ROUTE = '/framework-body';
const REQUEST = { method: 'POST', contentType: 'application/json' } as const;
const FRAMEWORK_CASES = [
  {
    name: 'invalid JSON',
    payload: '{',
    status: 400
  },
  {
    name: 'empty JSON',
    payload: '',
    status: 400
  },
  {
    name: 'invalid content length',
    payload: '{"value":1}',
    contentLength: '1',
    status: 400
  },
  {
    name: 'AJV body validation',
    payload: '{"value":"private-invalid-value"}',
    status: 400
  },
  {
    name: 'oversized body',
    payload: JSON.stringify({ value: 'x'.repeat(128) }),
    status: 413
  },
  {
    name: 'unsupported media type',
    payload: '<private-body/>',
    contentType: 'application/private-test',
    status: 415
  }
] as const;

describe.each([false, true])(
  'framework errors with response schemas=%s',
  (withSchemas) => {
    it.each(FRAMEWORK_CASES)(
      'preserves $name status and the full error body',
      async (scenario) => {
        const app = fastify({ logger: false, bodyLimit: 64 });
        try {
          await app.register(errorHandlerPlugin);
          await app.register(async (routes) => {
            routes.post(
              ROUTE,
              {
                schema: {
                  body: {
                    type: 'object',
                    required: ['value'],
                    properties: { value: { type: 'integer' } }
                  },
                  ...(withSchemas
                    ? {
                        response: {
                          400: ValidationError,
                          413: PayloadTooLargeError,
                          415: UnsupportedMediaTypeError,
                          500: InternalServerError
                        }
                      }
                    : {})
                }
              },
              async () => ({ success: true })
            );
          });

          const response = await app.inject({
            method: REQUEST.method,
            url: ROUTE,
            payload: scenario.payload,
            headers: {
              'content-type':
                'contentType' in scenario
                  ? scenario.contentType
                  : REQUEST.contentType,
              ...('contentLength' in scenario
                ? { 'content-length': scenario.contentLength }
                : {})
            }
          });

          expect(response.statusCode).toBe(scenario.status);
          expect(response.json()).toEqual({
            message: expect.stringMatching(/\S/),
            statusCode: scenario.status
          });
          expect(response.body).not.toContain('private-');
        } finally {
          await app.close();
        }
      }
    );
  }
);

it('preserves a sibling route success and explicit domain response serializer', async () => {
  const app = fastify({ logger: false });
  const domainResponse = {
    code: CategoryAlreadyExistsError.properties.code.enum[0],
    message: 'Категория с таким именем уже существует.',
    statusCode: 409
  } as const;
  try {
    await app.register(errorHandlerPlugin);
    await app.register(async (routes) => {
      routes.get(ROUTE, async () => ({ success: true }));
      routes.post(
        ROUTE,
        {
          schema: { response: { 409: CategoryAlreadyExistsError } }
        },
        async (_request, reply) =>
          reply.code(domainResponse.statusCode).send(domainResponse)
      );
    });

    expect((await app.inject(ROUTE)).json()).toEqual({ success: true });
    const response = await app.inject({ method: REQUEST.method, url: ROUTE });
    expect(response.statusCode).toBe(domainResponse.statusCode);
    expect(response.json()).toEqual(domainResponse);
  } finally {
    await app.close();
  }
});

it('returns a safe404 contract without reflecting the unknown URL', async () => {
  const app = fastify({ logger: false });
  const secretUrl = '/private-unknown-path?token=private-query-token';
  try {
    await app.register(errorHandlerPlugin);
    const response = await app.inject(secretUrl);
    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      message: expect.stringMatching(/\S/),
      statusCode: 404
    });
    expect(response.body).not.toContain('private-');
  } finally {
    await app.close();
  }
});
