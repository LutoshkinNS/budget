import fastify from 'fastify';
import { describe, expect, it } from 'vitest';

import errorHandlerPlugin from '../error-handler-plugin.js';

const PATH = '/native-error-headers';
const HEADER = {
  authenticate: 'www-authenticate',
  retry: 'retry-after',
  allow: 'allow',
  origin: 'access-control-allow-origin',
  cookie: 'set-cookie',
  private: 'x-private-error'
} as const;
const VALUE = {
  challenge: 'Bearer realm="budget"',
  retry: '60',
  allow: 'GET, POST',
  origin: 'https://budget.example',
  cookie: 'session=preserved; HttpOnly',
  secret: 'private-header-secret'
} as const;

async function request(headers: unknown) {
  const app = fastify({ logger: false });
  try {
    await app.register(errorHandlerPlugin);
    app.get(PATH, async (_request, reply) => {
      reply.header(HEADER.origin, VALUE.origin);
      reply.header(HEADER.cookie, VALUE.cookie);
      throw Object.assign(new Error(VALUE.secret), {
        statusCode: 429,
        headers
      });
    });
    return await app.inject(PATH);
  } finally {
    await app.close();
  }
}

describe('native error HTTP headers', () => {
  it('preserves the approved standard headers and existing CORS/cookies', async () => {
    const response = await request({
      'WWW-Authenticate': VALUE.challenge,
      'Retry-After': VALUE.retry,
      Allow: VALUE.allow,
      [HEADER.private]: VALUE.secret,
      [HEADER.cookie]: 'session=must-not-replace',
      [HEADER.origin]: 'https://must-not-replace.example'
    });

    expect(response.statusCode).toBe(429);
    expect(response.json()).toEqual({
      statusCode: 429,
      message: expect.stringMatching(/\S/)
    });
    expect(response.headers[HEADER.authenticate]).toBe(VALUE.challenge);
    expect(response.headers[HEADER.retry]).toBe(VALUE.retry);
    expect(response.headers[HEADER.allow]).toBe(VALUE.allow);
    expect(response.headers[HEADER.origin]).toBe(VALUE.origin);
    expect(response.headers[HEADER.cookie]).toBe(VALUE.cookie);
    expect(response.headers).not.toHaveProperty(HEADER.private);
    expect(response.body).not.toContain(VALUE.secret);
  });

  it('preserves repeated valid authentication challenges', async () => {
    const challenges = ['Basic realm="budget"', VALUE.challenge];
    const response = await request({ [HEADER.authenticate]: challenges });
    expect(response.statusCode).toBe(429);
    const actual = response.headers[HEADER.authenticate];
    expect(Array.isArray(actual) ? actual : actual?.split(', ')).toEqual(
      challenges
    );
  });

  it('preserves a valid Retry-After HTTP date', async () => {
    const httpDate = 'Wed, 21 Oct 2015 07:28:00 GMT';
    const response = await request({ [HEADER.retry]: httpDate });
    expect(response.statusCode).toBe(429);
    expect(response.headers[HEADER.retry]).toBe(httpDate);
    expect(response.json()).toEqual({
      statusCode: 429,
      message: expect.stringMatching(/\S/)
    });
  });

  it('preserves an Allow list supplied as an array of valid methods', async () => {
    const response = await request({ [HEADER.allow]: ['GET', 'POST'] });
    expect(response.statusCode).toBe(429);
    expect(response.headers[HEADER.allow]).toBe('GET, POST');
    expect(response.json()).toEqual({
      statusCode: 429,
      message: expect.stringMatching(/\S/)
    });
  });

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
      expect(response.statusCode).toBe(429);
      expect(response.json()).toEqual({
        statusCode: 429,
        message: expect.stringMatching(/\S/)
      });
      expect(response.headers).not.toHaveProperty(HEADER.authenticate);
      expect(response.headers).not.toHaveProperty(HEADER.retry);
      expect(response.headers).not.toHaveProperty(HEADER.allow);
      expect(response.headers[HEADER.origin]).toBe(VALUE.origin);
      expect(response.headers[HEADER.cookie]).toBe(VALUE.cookie);
    }
  );
});
