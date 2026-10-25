import type { FastifyReply, FastifyRequest } from 'fastify';

import type { FastifyApp } from '#src/app-init.js';

const ERRORS = {
  NOT_FOUND: {
    code: 'INVITATION_NOT_FOUND',
    message: 'Приглашение не найдено или уже использовано'
  }
} as const;

function formatInvitation(invitation: {
  id: number;
  code: string;
  accountId: number;
  expiresAt: Date;
  usedAt: Date | null;
  usedBy: bigint | null;
}) {
  return {
    id: invitation.id,
    code: invitation.code,
    accountId: invitation.accountId,
    expiresAt: invitation.expiresAt.toISOString(),
    ...(invitation.usedAt && { usedAt: invitation.usedAt.toISOString() }),
    ...(invitation.usedBy && { usedBy: invitation.usedBy })
  };
}

export async function redeemInvitationHandler(
  this: FastifyApp,
  req: FastifyRequest,
  reply: FastifyReply
) {
  const { userId } = req.user;
  const { code } = req.body as { code: string };

  const invitation = await this.prisma.accountInvitation.findFirst({
    where: {
      code,
      usedAt: null,
      expiresAt: { gt: new Date() }
    }
  });

  if (!invitation) {
    return reply.code(404).send(ERRORS.NOT_FOUND);
  }

  const userIdBig = BigInt(userId);
  const alreadyMember = await this.prisma.account.findFirst({
    where: {
      id: invitation.accountId,
      OR: [{ ownerId: userIdBig }, { users: { some: { userId: userIdBig } } }]
    }
  });

  if (alreadyMember) {
    return reply.send(formatInvitation(invitation));
  }

  const [, updatedInvitation] = await this.prisma.$transaction([
    this.prisma.accountUser.create({
      data: { userId: userIdBig, accountId: invitation.accountId }
    }),
    this.prisma.accountInvitation.update({
      where: { id: invitation.id },
      data: { usedAt: new Date(), usedBy: userIdBig }
    })
  ]);

  return reply.send(formatInvitation(updatedInvitation));
}
