import { TokenError } from 'fast-jwt';

import UnauthorizedError from '#s/UnauthorizedError.js';

type HttpStatusError = {
  status?: unknown;
  statusCode?: unknown;
};

const HTTP_STATUS_RANGE = {
  minimum: 400,
  maximum: 599
} as const;

export async function verifyJwtRequest<Result>(
  verify: () => Promise<Result>
): Promise<Result> {
  try {
    return await verify();
  } catch (error) {
    if (!(error instanceof TokenError) || hasHttpStatus(error)) {
      throw error;
    }

    throw createUnauthorizedError();
  }
}

function hasHttpStatus(error: unknown): error is HttpStatusError {
  const status = getNumberProperty(error, 'status');
  if (isHttpStatus(status)) return true;

  return isHttpStatus(getNumberProperty(error, 'statusCode'));
}

function getNumberProperty(value: unknown, property: string): number | undefined {
  if (typeof value !== 'object' || value === null) return undefined;

  try {
    const propertyValue: unknown = Reflect.get(value, property);
    return typeof propertyValue === 'number' ? propertyValue : undefined;
  } catch {
    return undefined;
  }
}

function isHttpStatus(value: number | undefined): value is number {
  return (
    value !== undefined &&
    Number.isInteger(value) &&
    value >= HTTP_STATUS_RANGE.minimum &&
    value <= HTTP_STATUS_RANGE.maximum
  );
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
