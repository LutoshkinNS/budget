import type { FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

import { FastifyApp } from '#src/app-init.js';

import { ERROR_HANDLER } from './constants.js';
import { getSafeErrorHeaders } from './error-headers.js';
import {
  getNotFoundError,
  HTTP_STATUS,
  normalizeError
} from './normalize-error.js';

function logError(
  request: FastifyRequest,
  normalized: ReturnType<typeof normalizeError>
) {
  const context = {
    requestId: request.id,
    category: normalized.category,
    statusCode: normalized.response.statusCode,
    phase: normalized.phase
  };

  if (normalized.response.statusCode >= HTTP_STATUS.serverErrorMinimum) {
    request.log.error(context, ERROR_HANDLER.logMessage.requestError);
  } else {
    request.log.warn(context, ERROR_HANDLER.logMessage.requestError);
  }
}

async function errorHandlerPlugin(app: FastifyApp) {
  app.setErrorHandler((error, request, reply) => {
    const normalized = normalizeError(error);
    logError(request, normalized);
    for (const [headerName, headerValue] of Object.entries(
      getSafeErrorHeaders(error)
    )) {
      reply.header(headerName, headerValue);
    }
    return reply.code(normalized.response.statusCode).send(normalized.response);
  });

  app.setNotFoundHandler((request, reply) => {
    const normalized = getNotFoundError();
    logError(request, normalized);
    return reply.code(normalized.response.statusCode).send(normalized.response);
  });
}

export default fp(errorHandlerPlugin, {
  name: ERROR_HANDLER.pluginName
});
