import type { FastifyRequest } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';

import type AuthClientEvent from '#s/AuthClientEvent.js';

type AuthClientEventBody = FromSchema<typeof AuthClientEvent>;

export function clientEventHandler(
  request: FastifyRequest<{ Body: AuthClientEventBody }>
) {
  request.log.info({
    event: 'auth_client_event',
    clientEvent: request.body.event,
    buildVersion: request.body.buildVersion,
    attemptId: request.body.attemptId,
    displayMode: request.body.displayMode,
    online: request.body.online,
    userAgent: request.headers['user-agent'],
    origin: request.headers.origin,
    referer: request.headers.referer
  });

  return { success: true };
}
