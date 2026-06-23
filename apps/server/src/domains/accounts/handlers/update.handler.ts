import type { FastifyReply, FastifyRequest } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';

import AccountId from '#s/AccountId.js';
import AccountUpdate from '#s/AccountUpdate.js';
import type { FastifyApp } from '#src/appInit.ts';

export type UpdateBody = FromSchema<typeof AccountUpdate>;
export type UpdateParams = { accountId: FromSchema<typeof AccountId> };

const ERRORS = {
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: 'Только владелец аккаунта может изменять настройки аккаунта'
  }
} as const;

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
    return reply.code(403).send(ERRORS.FORBIDDEN);
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
