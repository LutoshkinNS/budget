import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastify from 'fastify';
import { describe, expect, it, vi } from 'vitest';

import errorHandlerPlugin from '../error-handler-plugin.js';

const PATH = '/native-error-headers';
const NOT_FOUND_PATH = '/missing-error-headers';
const ERROR_HEADERS_PROPERTY = 'headers';
const HOOK = { request: 'onRequest' } as const;
const HEADER = {
  authenticate: 'www-authenticate',
  retry: 'retry-after',
  allow: 'allow',
  origin: 'access-control-allow-origin',
  credentials: 'access-control-allow-credentials',
  cookie: 'set-cookie',
  requestId: 'x-request-id',
  private: 'x-private-error'
} as const;
const VALUE = {
  challenge: 'Bearer realm="budget"',
  retry: '60',
  allow: 'GET, POST',
  origin: 'https://budget.example',
  credentials: 'true',
  cookie: 'session=preserved; HttpOnly',
  requestId: 'preserved-request-id',
  secret: 'private-header-secret'
} as const;
const COOKIE = {
  queued: 'queued-session',
  expired: 'expired-session',
  value: 'queued-cookie',
  path: '/',
  sameSite: 'lax'
} as const;
const STATUS = { limited: 429, internal: 500, notFound: 404 } as const;
const SAFE_MESSAGE = {
  limited: 'Слишком много запросов. Повторите попытку позже.',
  internal: 'Внутренняя ошибка сервера.',
  notFound: 'Запрошенный ресурс не найден.'
} as const;

async function createApp() {
  const app = fastify({ logger: false });
  await app.register(fastifyCors, { origin: VALUE.origin, credentials: true });
  await app.register(fastifyCookie);
  await app.register(errorHandlerPlugin);
  return app;
}

async function requestError(error: Error) {
  const app = await createApp();
  try {
    app.get(PATH, async (_request, reply) => {
      reply.header(HEADER.cookie, VALUE.cookie);
      reply.header(HEADER.requestId, VALUE.requestId);
      throw error;
    });
    return await app.inject({ url: PATH, headers: { origin: VALUE.origin } });
  } finally {
    await app.close();
  }
}

function request(headers: unknown) {
  return requestError(
    Object.assign(new Error(VALUE.secret), {
      statusCode: STATUS.limited,
      headers
    })
  );
}

describe('native error HTTP headers', () => {
  it('ignores exception headers while preserving existing reply headers', async () => {
    const response = await request({
      'WWW-Authenticate': VALUE.challenge,
      'Retry-After': VALUE.retry,
      Allow: VALUE.allow,
      [HEADER.private]: VALUE.secret,
      [HEADER.requestId]: 'must-not-replace-request-id',
      [HEADER.cookie]: 'session=must-not-replace',
      [HEADER.origin]: 'https://must-not-replace.example'
    });

    expect(response.statusCode).toBe(STATUS.limited);
    expect(response.json()).toEqual({
      statusCode: STATUS.limited,
      message: SAFE_MESSAGE.limited
    });
    expect(response.headers).not.toHaveProperty(HEADER.authenticate);
    expect(response.headers).not.toHaveProperty(HEADER.retry);
    expect(response.headers).not.toHaveProperty(HEADER.allow);
    expect(response.headers[HEADER.origin]).toBe(VALUE.origin);
    expect(response.headers[HEADER.credentials]).toBe(VALUE.credentials);
    expect(response.headers[HEADER.cookie]).toBe(VALUE.cookie);
    expect(response.headers[HEADER.requestId]).toBe(VALUE.requestId);
    expect(response.headers).not.toHaveProperty(HEADER.private);
    expect(response.body).not.toContain(VALUE.secret);
  });

  it('does not read an exception headers getter', async () => {
    const readHeaders = vi.fn(() => {
      throw new Error(VALUE.secret);
    });
    const error = Object.defineProperty(
      Object.assign(new Error(VALUE.secret), { statusCode: STATUS.limited }),
      ERROR_HEADERS_PROPERTY,
      { get: readHeaders }
    );
    const response = await requestError(error);

    expect(readHeaders).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(STATUS.limited);
    expect(response.json()).toEqual({
      statusCode: STATUS.limited,
      message: SAFE_MESSAGE.limited
    });
    expect(response.headers[HEADER.origin]).toBe(VALUE.origin);
    expect(response.headers[HEADER.cookie]).toBe(VALUE.cookie);
    expect(response.body).not.toContain(VALUE.secret);
  });

  it.each([PATH, NOT_FOUND_PATH])(
    'preserves real cookie and CORS plugins on %s',
    async (path) => {
      const app = await createApp();
      try {
        app.addHook(HOOK.request, async (_request, reply) => {
          reply.header(HEADER.cookie, VALUE.cookie);
          reply.header(HEADER.requestId, VALUE.requestId);
          reply.setCookie(COOKIE.queued, COOKIE.value, {
            path: COOKIE.path,
            httpOnly: true,
            sameSite: COOKIE.sameSite
          });
          reply.clearCookie(COOKIE.expired, {
            path: COOKIE.path,
            sameSite: COOKIE.sameSite
          });
        });
        app.get(PATH, async () => {
          throw new Error(VALUE.secret);
        });

        const response = await app.inject({
          url: path,
          headers: { origin: VALUE.origin }
        });
        const isFailure = path === PATH;
        const statusCode = isFailure ? STATUS.internal : STATUS.notFound;
        expect(response.statusCode).toBe(statusCode);
        expect(response.json()).toEqual({
          statusCode,
          message: isFailure ? SAFE_MESSAGE.internal : SAFE_MESSAGE.notFound
        });
        expect(response.headers[HEADER.origin]).toBe(VALUE.origin);
        expect(response.headers[HEADER.credentials]).toBe(VALUE.credentials);
        expect(response.headers[HEADER.requestId]).toBe(VALUE.requestId);
        expect(response.headers[HEADER.cookie]).toEqual(
          expect.arrayContaining([
            VALUE.cookie,
            `${COOKIE.queued}=${COOKIE.value}; Path=/; HttpOnly; SameSite=Lax`,
            `${COOKIE.expired}=; Max-Age=0; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
          ])
        );
        expect(response.body).not.toContain(VALUE.secret);
      } finally {
        await app.close();
      }
    }
  );

  it.each([
    { [HEADER.authenticate]: 'Bearer\r\nx-injected: secret' },
    { [HEADER.retry]: 60 },
    { [HEADER.retry]: '-1' },
    { [HEADER.retry]: ['60', '120'] },
    { [HEADER.allow]: ['GET', 'P OST'] },
    { [HEADER.authenticate]: 'Bearer realm="Бюджет"' },
    { [HEADER.allow]: ['GET', { secret: VALUE.secret }] },
    { [HEADER.authenticate]: { secret: VALUE.secret } },
    null,
    ['not-an-object-header-map']
  ])(
    'ignores invalid header values without losing the error response (%j)',
    async (headers) => {
      const response = await request(headers);
      expect(response.statusCode).toBe(STATUS.limited);
      expect(response.json()).toEqual({
        statusCode: STATUS.limited,
        message: SAFE_MESSAGE.limited
      });
      expect(response.headers).not.toHaveProperty(HEADER.authenticate);
      expect(response.headers).not.toHaveProperty(HEADER.retry);
      expect(response.headers).not.toHaveProperty(HEADER.allow);
      expect(response.headers[HEADER.origin]).toBe(VALUE.origin);
      expect(response.headers[HEADER.cookie]).toBe(VALUE.cookie);
    }
  );
});
