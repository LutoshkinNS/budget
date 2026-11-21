import { TokenError } from 'fast-jwt';

import UnauthorizedError from '#s/UnauthorizedError.js';

import { readHttpStatus } from '../error-handler/http-error-status.js';

export async function verifyJwtRequest<Result>(
  verify: () => Promise<Result>
): Promise<Result> {
  try {
    return await verify();
  } catch (error) {
    if (!(error instanceof TokenError) || readHttpStatus(error) !== undefined) {
      throw error;
    }

    throw createUnauthorizedError();
  }
}

function createUnauthorizedError(): Error {
  const error = new Error('JWT verification failed.');
  const statusCode = UnauthorizedError.properties.statusCode.default;

  Object.defineProperty(error, 'statusCode', {
    configurable: false,
    enumerable: true,
    value: statusCode,
    writable: false
  });

  return error;
}
