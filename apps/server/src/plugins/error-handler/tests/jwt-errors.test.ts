import { createHmac } from 'node:crypto';

import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import fastify from 'fastify';
import { describe, expect, it } from 'vitest';

import UnauthorizedError from '#s/UnauthorizedError.js';
import ValidationError from '#s/ValidationError.js';

import { verifyJwtRequest } from '../../jwt/verify-jwt-request.js';
import errorHandlerPlugin from '../error-handler-plugin.js';

const JWT_SECRET = 'isolated-jwt-errors-secret';
const ROUTE = '/protected';
const COOKIE_NAME = 'accessToken';
const JWT_MODE = {
  header: 'header',
  cookie: 'cookie',
  missingCookieParser: 'missing-cookie-parser'
} as const;

function signedToken(
  payload: unknown,
  algorithm = 'HS256',
  secret = JWT_SECRET
) {
  const header = Buffer.from(
    JSON.stringify({ alg: algorithm, typ: 'JWT' })
  ).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const content = `${header}.${body}`;
  return `${content}.${createHmac('sha256', secret).update(content).digest('base64url')}`;
}

const USER = { userId: 1 } as const;
const TOKEN_CASES = [
  {
    name: 'expired',
    token: signedToken({ ...USER, exp: 1 })
  },
  {
    name: 'invalid signature',
    token: signedToken(USER, 'HS256', 'other-private-key')
  },
  {
    name: 'unsigned',
    token: signedToken(USER).split('.').slice(0, 2).join('.') + '.'
  },
  {
    name: 'inactive',
    token: signedToken({ ...USER, nbf: Math.floor(Date.now() / 1000) + 3600 })
  },
  {
    name: 'invalid algorithm',
    token: signedToken(USER, 'HS384')
  },
  {
    name: 'invalid claim type',
    token: signedToken({ ...USER, exp: 'private-invalid-expiry' })
  },
  {
    name: 'invalid payload',
    token: signedToken('private-payload-string')
  }
] as const;

async function mount(
  options: {
    mode?: (typeof JWT_MODE)[keyof typeof JWT_MODE];
    trusted?: boolean;
    withSchemas?: boolean;
  } = {}
) {
  const app = fastify({ logger: false });
  const mode = options.mode ?? JWT_MODE.header;
  if (mode === JWT_MODE.cookie) await app.register(fastifyCookie);
  await app.register(fastifyJwt, {
    secret: JWT_SECRET,
    verify: { algorithms: ['HS256'] },
    ...(mode !== JWT_MODE.header
      ? { cookie: { cookieName: COOKIE_NAME, signed: false } }
      : {}),
    ...(options.trusted === false ? { trusted: () => false } : {})
  });
  await app.register(errorHandlerPlugin);
  await app.register(async (routes) => {
    routes.get(
      ROUTE,
      {
        preHandler: async (request) => {
          await verifyJwtRequest(() => request.jwtVerify());
        },
        ...(options.withSchemas
          ? {
              schema: {
                response: { 400: ValidationError, 401: UnauthorizedError }
              }
            }
          : {})
      },
      async () => ({ success: true })
    );
  });
  return { app };
}

describe.each([false, true])(
  'real JWT producers with response schemas=%s',
  (withSchemas) => {
    it.each(TOKEN_CASES)('normalizes $name token to401', async (scenario) => {
      const { app } = await mount({ withSchemas });
      try {
        const response = await app.inject({
          url: ROUTE,
          headers: { authorization: `Bearer ${scenario.token}` }
        });
        expect(response.statusCode).toBe(401);
        expect(response.json()).toEqual({
          message: expect.stringMatching(/\S/),
          statusCode: 401
        });
        expect(response.body).not.toContain('private-');
      } finally {
        await app.close();
      }
    });

    it('normalizes an actually untrusted verified token to401', async () => {
      const { app } = await mount({ withSchemas, trusted: false });
      try {
        const response = await app.inject({
          url: ROUTE,
          headers: { authorization: `Bearer ${signedToken(USER)}` }
        });
        expect(response.statusCode).toBe(401);
        expect(response.json()).toEqual({
          message: expect.stringMatching(/\S/),
          statusCode: 401
        });
      } finally {
        await app.close();
      }
    });
  }
);

const REQUEST_CASES = [
  {
    name: 'missing header',
    mode: JWT_MODE.header,
    status: 401
  },
  {
    name: 'missing cookie',
    mode: JWT_MODE.cookie,
    status: 401
  },
  {
    name: 'malformed header',
    mode: JWT_MODE.header,
    authorization: 'Bearer private-malformed-token extra',
    status: 400
  },
  {
    name: 'unavailable cookie parser',
    mode: JWT_MODE.missingCookieParser,
    status: 400
  }
] as const;

it.each(REQUEST_CASES)('distinguishes real $name request', async (scenario) => {
  const { app } = await mount({
    mode: scenario.mode,
    withSchemas: true
  });
  try {
    const response = await app.inject({
      url: ROUTE,
      ...('authorization' in scenario
        ? { headers: { authorization: scenario.authorization } }
        : {})
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
});

it('preserves successful JWT authentication', async () => {
  const { app } = await mount();
  try {
    const response = await app.inject({
      url: ROUTE,
      headers: { authorization: `Bearer ${signedToken(USER)}` }
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ success: true });
  } finally {
    await app.close();
  }
});
