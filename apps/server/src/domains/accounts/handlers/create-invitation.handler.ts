import { randomBytes } from 'node:crypto';

import type { FastifyReply, FastifyRequest } from 'fastify';

import ForbiddenError from '#s/ForbiddenError.js';
import type { FastifyApp } from '#src/app-init.js';
import { createErrorResponse } from '#src/plugins/error-handler/error-responses.js';

const INVITATION_TTL_HOURS = 72;
const forbiddenMessage = 'Только владелец аккаунта может создавать приглашения';

const forbidden = createErrorResponse(
  ForbiddenError,
  ForbiddenError.properties.statusCode.default,
  forbiddenMessage
);

export async function createInvitationHandler(
  this: FastifyApp,
  req: FastifyRequest,
  reply: FastifyReply
) {
  const { userId } = req.user;
  const { accountId: accountIdParam } = req.params as { accountId: string };
  const accountId = Number(accountIdParam);

  const account = await this.prisma.account.findFirst({
    where: { id: accountId, ownerId: BigInt(userId) }
  });

  if (!account) {
    return reply.code(forbidden.statusCode).send(forbidden);
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
