import type { FastifyError, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

import { FastifyApp } from '#src/appInit.js';

import {
  CUSTOM_ERROR_CODES,
  CustomErrorCode,
  FASTIFY_JWT_ERROR_CODES,
  isJwtError
} from './errorCodes.js';

type ErrorResponse = {
  code: CustomErrorCode;
  message: string;
  statusCode: number;
};

function sanitizeUrl(url: string) {
  try {
    const parsed = new URL(url, 'http://localhost');
    const queryKeys = Array.from(parsed.searchParams.keys());
    const query = queryKeys.length > 0 ? `?${queryKeys.join('&')}` : '';

    return `${parsed.pathname}${query}`;
  } catch {
    return url.split('?')[0] || url;
  }
}

function sanitizeReferer(referer: string | undefined) {
  if (!referer) return undefined;

  try {
    const parsed = new URL(referer);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return sanitizeUrl(referer);
  }
}

function getSafeRequestContext(request: FastifyRequest) {
  const cookieHeader = request.headers.cookie;

  return {
    method: request.method,
    url: sanitizeUrl(request.url),
    userAgent: request.headers['user-agent'],
    origin: request.headers.origin,
    referer: sanitizeReferer(request.headers.referer),
    hasCookieHeader: Boolean(cookieHeader),
    hasAccessTokenCookie: Boolean(request.cookies?.accessToken),
    hasRefreshTokenCookie: Boolean(request.cookies?.refreshToken)
  };
}

async function errorHandlerPlugin(app: FastifyApp) {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    const errorResponse: ErrorResponse = {
      code: error.code as CustomErrorCode, // BAD
      message: error.message,
      statusCode: error.statusCode || 500
    };

    if (error.name) {
      errorResponse.message = error.name;
    }

    // Fastify validation errors
    if (error.validation) {
      errorResponse.code = CUSTOM_ERROR_CODES.VALIDATION_ERROR;
      errorResponse.statusCode = 400;
      errorResponse.message = error.validation.join(', ');
    }

    // JWT errors
    if (isJwtError(error.code)) {
      errorResponse.statusCode = 401;
      switch (error.code) {
        case FASTIFY_JWT_ERROR_CODES.NO_AUTHORIZATION_IN_COOKIE:
        case FASTIFY_JWT_ERROR_CODES.NO_AUTHORIZATION_IN_HEADER:
          errorResponse.code = CUSTOM_ERROR_CODES.MISSING_TOKEN;
          break;
        case FASTIFY_JWT_ERROR_CODES.AUTHORIZATION_TOKEN_EXPIRED:
          errorResponse.code = CUSTOM_ERROR_CODES.INVALID_TOKEN;
          break;
        case FASTIFY_JWT_ERROR_CODES.AUTHORIZATION_TOKEN_INVALID:
        case FASTIFY_JWT_ERROR_CODES.AUTHORIZATION_TOKEN_UNTRUSTED:
          errorResponse.code = CUSTOM_ERROR_CODES.INVALID_TOKEN;
          break;
        default:
          errorResponse.code = CUSTOM_ERROR_CODES.UNAUTHORIZED;
      }
    }

    const logContext = {
      err: error,
      request: getSafeRequestContext(request),
      response: {
        code: errorResponse.code,
        statusCode: errorResponse.statusCode
      }
    };

    if (errorResponse.statusCode >= 500) {
      request.log.error(logContext, 'request_error');
    } else {
      request.log.warn(logContext, 'request_error');
    }

    reply.status(errorResponse.statusCode).send(errorResponse);
  });
}

export default fp(errorHandlerPlugin, {
  name: 'errorHandler'
});
