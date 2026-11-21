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
import { HTTP_STATUS, readHttpStatus } from './http-error-status.js';
import type { ErrorCategory, NormalizedError } from './types.js';

export { HTTP_STATUS } from './http-error-status.js';

const ERROR_SCHEMAS: Partial<
  Record<number, Parameters<typeof createErrorResponse>[0]>
> = {
  [HTTP_STATUS.badRequest]: ValidationError,
  [HTTP_STATUS.unauthorized]: UnauthorizedError,
  [HTTP_STATUS.forbidden]: ForbiddenError,
  [HTTP_STATUS.notFound]: NotFoundError,
  [HTTP_STATUS.conflict]: ConflictError,
  [HTTP_STATUS.payloadTooLarge]: PayloadTooLargeError,
  [HTTP_STATUS.unsupportedMediaType]: UnsupportedMediaTypeError,
  [HTTP_STATUS.tooManyRequests]: TooManyRequestsError
};

export function normalizeError(error: unknown): NormalizedError {
  const status = readHttpStatus(error);
  const responseStatus = status ?? HTTP_STATUS.internalServerError;
  const schema =
    ERROR_SCHEMAS[responseStatus] ??
    (responseStatus <= HTTP_STATUS.clientErrorMaximum
      ? RequestError
      : InternalServerError);
  const response = createErrorResponse(schema, responseStatus);

  return {
    response,
    category: getCategory(responseStatus),
    phase: ERROR_HANDLER.phase.handler
  };
}

export function getNotFoundError(): NormalizedError {
  return {
    response: createErrorResponse(NotFoundError, HTTP_STATUS.notFound),
    category: ERROR_HANDLER.category.notFound,
    phase: ERROR_HANDLER.phase.router
  };
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
