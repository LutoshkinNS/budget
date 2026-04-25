import type { FastifyReply, FastifyRequest } from 'fastify';

import type { FastifyApp } from '#src/appInit.js';

type ListMembersParams = { accountId: number };

const FORBIDDEN = {
  code: 'FORBIDDEN',
  message: 'Доступ к участникам этого аккаунта запрещён',
  statusCode: 403
} as const;

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
    return reply.code(403).send(FORBIDDEN);
  }

  const isMember =
    account.ownerId === requesterId ||
    account.users.some((au) => au.userId === requesterId);

  if (!isMember) {
    return reply.code(403).send(FORBIDDEN);
  }

  return [
    {
      userId: Number(account.owner.id),
      firstName: account.owner.firstName,
      photoUrl: account.owner.photoUrl
    },
    ...account.users.map((au) => ({
      userId: Number(au.user.id),
      firstName: au.user.firstName,
      photoUrl: au.user.photoUrl
    }))
  ];
}
