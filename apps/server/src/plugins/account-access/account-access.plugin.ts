import type { FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

import ForbiddenError from '#s/ForbiddenError.js';
import type { FastifyApp } from '#src/app-init.js';
import { createErrorResponse } from '#src/plugins/error-handler/error-responses.js';

const forbiddenMessage = 'Нет доступа к этому счёту';

const forbidden = createErrorResponse(
  ForbiddenError,
  ForbiddenError.properties.statusCode.default,
  forbiddenMessage
);

function readAccountIdParam(params: unknown): number | undefined {
  if (typeof params !== 'object' || params === null || !('accountId' in params)) {
    return undefined;
  }

  const value: unknown = params.accountId;
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value;
  }

  return undefined;
}

// Счёт определяется URL, потому что токен удостоверяет только пользователя.
async function accountAccessPlugin(app: FastifyApp) {
  app.decorate(
    'requireAccountAccess',
    async function (this: FastifyApp, req: FastifyRequest, reply: FastifyReply) {
      const accountId = readAccountIdParam(req.params);

      if (accountId !== undefined) {
        const userId = BigInt(req.user.userId);
        const account = await this.prisma.account.findFirst({
          where: {
            id: accountId,
            OR: [{ ownerId: userId }, { users: { some: { userId } } }]
          }
        });

        if (account) return;
      }

      // Единый ответ не раскрывает существование чужого счёта.
      return reply.code(forbidden.statusCode).send(forbidden);
    }
  );
}

export default fp(accountAccessPlugin);
