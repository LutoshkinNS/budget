import { randomBytes } from 'node:crypto';

import type { FastifyReply, FastifyRequest } from 'fastify';

import type { FastifyApp } from '#src/appInit.js';

const INVITATION_TTL_HOURS = 72;

const ERRORS = {
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: 'Только владелец аккаунта может создавать приглашения'
  }
} as const;

export async function createInvitationHandler(
  this: FastifyApp,
  req: FastifyRequest,
  reply: FastifyReply
) {
  const { userId } = req.user;
  const { accountId: accountIdParam } = req.params as { accountId: string };
  const accountId = Number(accountIdParam);

  // Только владелец может создавать инвайты
  const account = await this.prisma.account.findFirst({
    where: { id: accountId, ownerId: BigInt(userId) }
  });

  if (!account) {
    return reply.code(403).send(ERRORS.FORBIDDEN);
  }

  const code = randomBytes(4).toString('hex');
  const expiresAt = new Date(Date.now() + INVITATION_TTL_HOURS * 60 * 60 * 1000);

  const invitation = await this.prisma.accountInvitation.create({
    data: { code, accountId, createdBy: BigInt(userId), expiresAt }
  });

  return reply.send({
    id: invitation.id,
    code: invitation.code,
    accountId: invitation.accountId,
    expiresAt: invitation.expiresAt.toISOString(),
    ...(invitation.usedAt && { usedAt: invitation.usedAt.toISOString() }),
    ...(invitation.usedBy && { usedBy: invitation.usedBy })
  });
}