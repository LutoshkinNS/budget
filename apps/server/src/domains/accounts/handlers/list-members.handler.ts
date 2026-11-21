import type { FastifyReply, FastifyRequest } from 'fastify';

import ForbiddenError from '#s/ForbiddenError.js';
import type { FastifyApp } from '#src/app-init.js';
import { createErrorResponse } from '#src/plugins/error-handler/error-responses.js';

type ListMembersParams = { accountId: number };

const forbiddenMessage = 'Доступ к участникам этого аккаунта запрещён';

const forbidden = createErrorResponse(
  ForbiddenError,
  ForbiddenError.properties.statusCode.default,
  forbiddenMessage
);

export async function listMembersHandler(
  this: FastifyApp,
  req: FastifyRequest<{ Params: ListMembersParams }>,
  reply: FastifyReply
) {
  const accountId = Number(req.params.accountId);
  const requesterId = BigInt(req.user.userId);

  const account = await this.prisma.account.findUnique({
    where: { id: accountId },
    include: {
      owner: true,
      users: { include: { user: true } }
    }
  });

  if (!account) {
    return reply.code(forbidden.statusCode).send(forbidden);
  }

  const isMember =
    account.ownerId === requesterId ||
    account.users.some((au) => au.userId === requesterId);

  if (!isMember) {
    return reply.code(forbidden.statusCode).send(forbidden);
  }

  return [
    {
      userId: Number(account.owner.id),
      firstName: account.owner.firstName,
      photoUrl: account.owner.photoUrl
    },
    ...account.users
      .filter((accountUser) => accountUser.userId !== account.ownerId)
      .map((accountUser) => ({
        userId: Number(accountUser.user.id),
        firstName: accountUser.user.firstName,
        photoUrl: accountUser.user.photoUrl
      }))
  ];
}
