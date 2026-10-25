import type { FastifyReply, FastifyRequest } from 'fastify';

import '@fastify/jwt';

declare module 'fastify' {
  interface FastifyInstance {
    requireAccountAccess: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}
