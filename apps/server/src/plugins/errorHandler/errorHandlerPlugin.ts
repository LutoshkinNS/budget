import type { FastifyError } from 'fastify';
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

async function errorHandlerPlugin(app: FastifyApp) {
  app.setErrorHandler((error: FastifyError, _request, reply) => {
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

    if (errorResponse.statusCode >= 500) {
      app.log.error(error);
    } else {
      app.log.warn(error);
    }

    reply.status(errorResponse.statusCode).send(errorResponse);
  });
}

export default fp(errorHandlerPlugin, {
  name: 'errorHandler'
});
