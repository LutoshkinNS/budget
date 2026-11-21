import { describe, expect, it } from 'vitest';

import { normalizeError } from '../normalize-error.js';

const UNKNOWN_CODES = ['toString', 'constructor', '__proto__'] as const;
const PRIMITIVE_FAILURES = [
  null,
  undefined,
  true,
  17,
  'private-primitive'
] as const;
const UNTRUSTED_CODES = [
  'FST_JWT_PRIVATE_UNKNOWN',
  'FAST_JWT_PRIVATE_UNKNOWN',
  'UNAUTHORIZED',
  'INVALID_TOKEN',
  'MISSING_TOKEN'
] as const;
const UNKNOWN_VALIDATION_FAILURE = {
  code: 'PRIVATE_DRIVER_VALIDATION',
  validation: []
} as const;

describe('normalizer unknown failures', () => {
  it.each(PRIMITIVE_FAILURES)('normalizes primitive %s to safe500', (cause) => {
    const normalized = normalizeError(cause);
    expect(normalized.response).toEqual({
      message: expect.stringMatching(/\S/),
      statusCode: 500
    });
  });

  it.each(UNTRUSTED_CODES)(
    'uses native status without exposing public or unknown JWT code %s',
    (code) => {
      const normalized = normalizeError({ code, statusCode: 401 });
      expect(normalized.response).toEqual({
        message: expect.stringMatching(/\S/),
        statusCode: 401
      });
    }
  );

  it.each(UNKNOWN_CODES)('does not trust inherited mapping key %s', (code) => {
    const normalized = normalizeError({ code });

    expect(normalized.response).toEqual({
      message: expect.stringMatching(/\S/),
      statusCode: 500
    });
  });

  it('does not classify an arbitrary validation-shaped exception as a request error', () => {
    const normalized = normalizeError(UNKNOWN_VALIDATION_FAILURE);

    expect(normalized.response).toEqual({
      message: expect.stringMatching(/\S/),
      statusCode: 500
    });
  });
});
