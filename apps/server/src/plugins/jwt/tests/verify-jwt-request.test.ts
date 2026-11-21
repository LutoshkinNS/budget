import { TokenError } from 'fast-jwt';
import fastify from 'fastify';
import { describe, expect, it, vi } from 'vitest';

import errorHandlerPlugin from '../../error-handler/error-handler-plugin.js';
import jwtPlugin from '../jwt-plugin.js';
import { verifyJwtRequest } from '../verify-jwt-request.js';

const SECRET = 'private-jwt-boundary-secret';
const PATH = '/verify-boundary';
const HTTP_FIELD = { status: 'status', statusCode: 'statusCode' } as const;
const STATUS = {
  forbidden: 403,
  limited: 429,
  unauthorized: 401,
  invalid: 600
} as const;

function tokenError() {
  return new TokenError(TokenError.codes.missingSignature, SECRET);
}

async function responseAfterVerify(failure: Error, duringVerify: boolean) {
  const app = fastify({ logger: false });
  try {
    await app.register(errorHandlerPlugin);
    app.get(PATH, async () => {
      await verifyJwtRequest(async () => {
        if (duringVerify) throw failure;
      });
      throw failure;
    });
    return await app.inject(PATH);
  } finally {
    await app.close();
  }
}

describe('JWT verification error boundary', () => {
  it('converts the public raw TokenError only inside verify to a safe401', async () => {
    const response = await responseAfterVerify(tokenError(), true);
    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      statusCode: 401,
      message: 'Требуется действительная авторизация.'
    });
    expect(response.body).not.toContain(SECRET);
  });

  it.each([400, 403, 429, 503])(
    'preserves an existing native HTTP%s on a TokenError',
    async (statusCode) => {
      const original = Object.assign(tokenError(), { statusCode });
      await expect(
        verifyJwtRequest(async () => {
          throw original;
        })
      ).rejects.toBe(original);
      const response = await responseAfterVerify(original, true);
      expect(response.statusCode).toBe(statusCode);
      expect(response.json()).toEqual({
        statusCode,
        message: expect.stringMatching(/\S/)
      });
    }
  );

  it('preserves a valid status without reading a lower-priority statusCode getter', async () => {
    const readStatusCode = vi.fn(() => {
      throw new Error(SECRET);
    });
    const original = Object.defineProperty(
      Object.assign(tokenError(), { status: STATUS.forbidden }),
      HTTP_FIELD.statusCode,
      { get: readStatusCode }
    );

    await expect(
      verifyJwtRequest(async () => {
        throw original;
      })
    ).rejects.toBe(original);
    expect(readStatusCode).not.toHaveBeenCalled();
  });

  it('preserves statusCode and error identity when the status getter throws', async () => {
    const original = Object.defineProperty(
      Object.assign(tokenError(), { statusCode: STATUS.limited }),
      HTTP_FIELD.status,
      {
        get() {
          throw new Error(SECRET);
        }
      }
    );

    await expect(
      verifyJwtRequest(async () => {
        throw original;
      })
    ).rejects.toBe(original);
    const response = await responseAfterVerify(original, true);
    expect(response.statusCode).toBe(STATUS.limited);
    expect(response.json()).toEqual({
      statusCode: STATUS.limited,
      message: 'Слишком много запросов. Повторите попытку позже.'
    });
    expect(response.body).not.toContain(SECRET);
  });

  it('adapts a verify TokenError with invalid native status fields to safe401', async () => {
    const original = Object.assign(tokenError(), {
      status: String(STATUS.unauthorized),
      statusCode: STATUS.invalid
    });
    const response = await responseAfterVerify(original, true);

    expect(response.statusCode).toBe(STATUS.unauthorized);
    expect(response.json()).toEqual({
      statusCode: STATUS.unauthorized,
      message: 'Требуется действительная авторизация.'
    });
    expect(response.body).not.toContain(SECRET);
  });

  it('keeps an unknown verify error a server failure', async () => {
    const original = new Error(SECRET);
    await expect(
      verifyJwtRequest(async () => {
        throw original;
      })
    ).rejects.toBe(original);
    const response = await responseAfterVerify(original, true);
    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      statusCode: 500,
      message: 'Внутренняя ошибка сервера.'
    });
  });

  it('keeps signing or post-verification TokenError outside the401 boundary', async () => {
    const response = await responseAfterVerify(tokenError(), false);
    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      statusCode: 500,
      message: 'Внутренняя ошибка сервера.'
    });
  });

  it('rejects invalid static JWT configuration during startup', async () => {
    const app = fastify({ logger: false });
    app.decorate('envs', { JWT_SECRET: '' });
    try {
      app.register(jwtPlugin);
      await expect(app.ready()).rejects.toThrow();
    } finally {
      await app.close();
    }
  });
});
