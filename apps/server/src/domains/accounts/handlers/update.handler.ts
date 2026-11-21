import type { FastifyReply, FastifyRequest } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';

import AccountId from '#s/AccountId.js';
import AccountUpdate from '#s/AccountUpdate.js';
import ForbiddenError from '#s/ForbiddenError.js';
import type { FastifyApp } from '#src/app-init.js';
import { createErrorResponse } from '#src/plugins/error-handler/error-responses.js';

export type UpdateBody = FromSchema<typeof AccountUpdate>;
export type UpdateParams = { accountId: FromSchema<typeof AccountId> };

const forbiddenMessage = 'Только владелец аккаунта может изменять настройки аккаунта';

const forbidden = createErrorResponse(
  ForbiddenError,
  ForbiddenError.properties.statusCode.default,
  forbiddenMessage
);

export async function updateAccountHandler(
  this: FastifyApp,
  req: FastifyRequest<{ Params: UpdateParams; Body: UpdateBody }>,
  reply: FastifyReply
) {
  const { accountId } = req.params;
  const { userId } = req.user;

  const id = Number(accountId);

  const account = await this.prisma.account.findFirst({
    where: { id, ownerId: BigInt(userId) }
  });

  if (!account) {
    return reply.code(forbidden.statusCode).send(forbidden);
  }

  const updated = await this.prisma.account.update({
    where: { id },
    data: {
      ...(req.body.name != null && { name: req.body.name }),
      ...(req.body.initialBalance != null && {
        initialBalance: req.body.initialBalance,
        initialBalanceDate: new Date()
      })
    }
  });

  return reply.send({
    id: updated.id,
    name: updated.name,
    initialBalance: updated.initialBalance,
    ownerId: Number(updated.ownerId),
    createdAt: updated.createdAt.toISOString()
  });
}
