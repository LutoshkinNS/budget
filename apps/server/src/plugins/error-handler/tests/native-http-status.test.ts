import fastify from 'fastify';
import { describe, expect, it } from 'vitest';

import ErrorDTO from '#s/ErrorDTO.js';
import InternalServerError from '#s/InternalServerError.js';

import errorHandlerPlugin from '../error-handler-plugin.js';
import { normalizeError } from '../normalize-error.js';

const SECRET = {
  code: 'PRIVATE_DRIVER_CODE',
  message: 'password=native-status-secret',
  name: 'PrivateDatabaseFailure',
  stack: '/private/database.ts:42'
} as const;
const STATUS_CASES = [
  {
    name: 'status before statusCode',
    status: 403,
    statusCode: 401,
    expected: 403
  },
  { name: 'statusCode without status', statusCode: 401, expected: 401 },
  {
    name: 'invalid status falls back to statusCode',
    status: 399,
    statusCode: 429,
    expected: 429
  },
  {
    name: 'fractional status falls back to statusCode',
    status: 401.5,
    statusCode: 404,
    expected: 404
  },
  { name: 'minimum status', status: 400, expected: 400 },
  { name: 'maximum status', status: 599, expected: 599 },
  { name: 'unknown client status', status: 418, expected: 418 },
  { name: 'server status preserved', status: 503, expected: 503 },
  { name: 'string status is invalid', status: '401', expected: 500 },
  { name: 'status below range is invalid', status: 399, expected: 500 },
  { name: 'status above range is invalid', statusCode: 600, expected: 500 },
  {
    name: 'fractional statusCode is invalid',
    statusCode: 400.5,
    expected: 500
  },
  { name: 'NaN is invalid', status: Number.NaN, expected: 500 },
  {
    name: 'infinity is invalid',
    statusCode: Number.POSITIVE_INFINITY,
    expected: 500
  },
  { name: 'absent HTTP fields', expected: 500 }
] as const;
const MESSAGE_CASES = [
  { status: 400, message: 'Некорректные параметры запроса.' },
  { status: 401, message: 'Требуется действительная авторизация.' },
  { status: 404, message: 'Запрошенный ресурс не найден.' },
  { status: 413, message: 'Размер запроса превышает допустимый.' },
  { status: 415, message: 'Неподдерживаемый формат данных запроса.' }
] as const;
const INTERNAL_MESSAGE = 'Внутренняя ошибка сервера.';

describe('native HTTP status normalization', () => {
  it.each(STATUS_CASES)('uses $name', (scenario) => {
    const error = Object.assign(new Error(SECRET.message), SECRET, scenario);
    const { response } = normalizeError(error);

    expect(response).toEqual({
      statusCode: scenario.expected,
      message: expect.stringMatching(/\S/)
    });
    for (const value of Object.values(SECRET)) {
      expect(JSON.stringify(response)).not.toContain(value);
    }
    if (scenario.expected >= 500) {
      expect(response.message).toBe(INTERNAL_MESSAGE);
    }
  });

  it.each(MESSAGE_CASES)(
    'chooses safe HTTP$status metadata',
    ({ status, message }) => {
      expect(
        normalizeError({ statusCode: status, ...SECRET }).response
      ).toEqual({
        statusCode: status,
        message
      });
    }
  );

  it('does not infer400 from an arbitrary validation property', () => {
    expect(normalizeError({ validation: [], ...SECRET }).response).toEqual({
      statusCode: 500,
      message: INTERNAL_MESSAGE
    });
  });

  it('does not read exception code to override a native status', () => {
    expect(
      normalizeError({ statusCode: 429, code: 'FST_ERR_VALIDATION' }).response
    ).toEqual({
      statusCode: 429,
      message: expect.stringMatching(/\S/)
    });
  });

  it('does not fail when an HTTP field getter throws', () => {
    const error = Object.defineProperty({ statusCode: 403 }, 'status', {
      get() {
        throw new Error(SECRET.message);
      }
    });
    expect(normalizeError(error).response).toEqual({
      statusCode: 403,
      message: expect.stringMatching(/\S/)
    });
  });
});

describe.each([false, true])(
  'native HTTP status with response serializer=%s',
  (withSchema) => {
    it.each([403, 418, 429, 503, 599])(
      'preserves HTTP%s in body and wire status',
      async (statusCode) => {
        const app = fastify({ logger: false });
        try {
          await app.register(errorHandlerPlugin);
          app.get(
            '/native-status',
            {
              ...(withSchema
                ? {
                    schema: {
                      response: {
                        [statusCode]:
                          statusCode >= 500 ? InternalServerError : ErrorDTO
                      }
                    }
                  }
                : {})
            },
            async () => {
              throw Object.assign(new Error(SECRET.message), SECRET, {
                statusCode
              });
            }
          );
          const response = await app.inject('/native-status');
          expect(response.statusCode).toBe(statusCode);
          expect(response.json()).toEqual({
            statusCode,
            message:
              statusCode >= 500 ? INTERNAL_MESSAGE : expect.stringMatching(/\S/)
          });
          for (const value of Object.values(SECRET))
            expect(response.body).not.toContain(value);
        } finally {
          await app.close();
        }
      }
    );
  }
);
