import fastify from 'fastify';
import { describe, expect, it } from 'vitest';

import errorHandlerPlugin from '../error-handler-plugin.js';

const UNKNOWN_FAILURE = {
  path: '/unknown-failure',
  code: 'PRIVATE_DRIVER_CODE',
  name: 'PrivateDatabaseFailure',
  message: 'password=unknown-failure-secret',
  stack: 'PrivateDatabaseFailure at /private/database/connection.ts:42'
} as const;
const INHERITED_MAPPING_CODE = 'toString';

describe('error handler HTTP boundary', () => {
  it('returns the safe contract for an inherited mapping key', async () => {
    const app = fastify({ logger: false });
    try {
      await app.register(errorHandlerPlugin);
      app.get(UNKNOWN_FAILURE.path, async () => {
        throw Object.assign(new Error(UNKNOWN_FAILURE.message), {
          code: INHERITED_MAPPING_CODE
        });
      });

      const response = await app.inject(UNKNOWN_FAILURE.path);

      expect(response.statusCode).toBe(500);
      expect(response.json()).toEqual({
        message: expect.stringMatching(/\S/),
        statusCode: 500
      });
    } finally {
      await app.close();
    }
  });

  it('returns safe 500 without leaking unknown exception fields', async () => {
    const app = fastify({ logger: false });
    try {
      await app.register(errorHandlerPlugin);
      app.get(UNKNOWN_FAILURE.path, async () => {
        throw Object.assign(new Error(UNKNOWN_FAILURE.message), {
          code: UNKNOWN_FAILURE.code,
          name: UNKNOWN_FAILURE.name,
          stack: UNKNOWN_FAILURE.stack
        });
      });

      const response = await app.inject(UNKNOWN_FAILURE.path);

      expect(response.statusCode).toBe(500);
      expect(response.json()).toEqual({
        message: expect.stringMatching(/\S/),
        statusCode: 500
      });
      for (const value of [
        UNKNOWN_FAILURE.code,
        UNKNOWN_FAILURE.name,
        UNKNOWN_FAILURE.message,
        UNKNOWN_FAILURE.stack
      ]) {
        expect(response.body).not.toContain(value);
      }
    } finally {
      await app.close();
    }
  });
});
