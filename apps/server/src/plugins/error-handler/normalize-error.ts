import ConflictError from '#s/ConflictError.js';
import ForbiddenError from '#s/ForbiddenError.js';
import InternalServerError from '#s/InternalServerError.js';
import NotFoundError from '#s/NotFoundError.js';
import PayloadTooLargeError from '#s/PayloadTooLargeError.js';
import RequestError from '#s/RequestError.js';
import TooManyRequestsError from '#s/TooManyRequestsError.js';
import UnauthorizedError from '#s/UnauthorizedError.js';
import UnsupportedMediaTypeError from '#s/UnsupportedMediaTypeError.js';
import ValidationError from '#s/ValidationError.js';

import { ERROR_HANDLER } from './constants.js';
import { createErrorResponse } from './error-responses.js';
import type { ErrorCategory, ErrorPhase, NormalizedError } from './types.js';

export const HTTP_STATUS = {
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  conflict: 409,
  payloadTooLarge: 413,
  unsupportedMediaType: 415,
  tooManyRequests: 429,
  clientErrorMinimum: 400,
  clientErrorMaximum: 499,
  serverErrorMinimum: 500,
  serverErrorMaximum: 599,
  internalServerError: 500
} as const;

export function normalizeError(error: unknown): NormalizedError {
  const status = readHttpStatus(error);
  const responseStatus = status ?? HTTP_STATUS.internalServerError;
  const statusSchema = getErrorSchema(responseStatus);
  const response = createErrorResponse(statusSchema.schema, responseStatus);

  return {
    response,
    category: getCategory(responseStatus),
    phase: getPhase()
  };
}

export function getNotFoundError(): NormalizedError {
  return {
    response: createErrorResponse(NotFoundError, HTTP_STATUS.notFound),
    category: ERROR_HANDLER.category.notFound,
    phase: ERROR_HANDLER.phase.router
  };
}

function getErrorSchema(statusCode: number) {
  if (statusCode === HTTP_STATUS.badRequest) {
    return { schema: ValidationError };
  }
  if (statusCode === HTTP_STATUS.unauthorized) {
    return { schema: UnauthorizedError };
  }
  if (statusCode === HTTP_STATUS.forbidden) {
    return { schema: ForbiddenError };
  }
  if (statusCode === HTTP_STATUS.notFound) {
    return { schema: NotFoundError };
  }
  if (statusCode === HTTP_STATUS.conflict) {
    return { schema: ConflictError };
  }
  if (statusCode === HTTP_STATUS.payloadTooLarge) {
    return { schema: PayloadTooLargeError };
  }
  if (statusCode === HTTP_STATUS.unsupportedMediaType) {
    return { schema: UnsupportedMediaTypeError };
  }
  if (statusCode === HTTP_STATUS.tooManyRequests) {
    return { schema: TooManyRequestsError };
  }
  if (
    statusCode >= HTTP_STATUS.clientErrorMinimum &&
    statusCode <= HTTP_STATUS.clientErrorMaximum
  ) {
    return { schema: RequestError };
  }
  return { schema: InternalServerError };
}

function readHttpStatus(error: unknown): number | undefined {
  const status = readNumberProperty(error, 'status');
  if (isHttpErrorStatus(status)) return status;

  const statusCode = readNumberProperty(error, 'statusCode');
  return isHttpErrorStatus(statusCode) ? statusCode : undefined;
}

function isHttpErrorStatus(value: number | undefined): value is number {
  return (
    value !== undefined &&
    Number.isInteger(value) &&
    value >= HTTP_STATUS.clientErrorMinimum &&
    value <= HTTP_STATUS.serverErrorMaximum
  );
}

function readNumberProperty(value: unknown, property: string): number | undefined {
  if (typeof value !== 'object' || value === null) return undefined;

  try {
    const propertyValue: unknown = Reflect.get(value, property);
    return typeof propertyValue === 'number' ? propertyValue : undefined;
  } catch {
    return undefined;
  }
}

function getCategory(statusCode: number): ErrorCategory {
  if (
    statusCode === HTTP_STATUS.badRequest ||
    statusCode === HTTP_STATUS.payloadTooLarge ||
    statusCode === HTTP_STATUS.unsupportedMediaType
  ) {
    return ERROR_HANDLER.category.validation;
  }
  if (statusCode === HTTP_STATUS.unauthorized) {
    return ERROR_HANDLER.category.authentication;
  }
  if (statusCode === HTTP_STATUS.notFound) {
    return ERROR_HANDLER.category.notFound;
  }
  return ERROR_HANDLER.category.unknown;
}

function getPhase(): ErrorPhase {
  return ERROR_HANDLER.phase.handler;
}
