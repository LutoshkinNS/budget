import type { FastifyReply, FastifyRequest } from 'fastify';

import type { FastifyApp } from '#src/appInit.js';

import {
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  AUTH_ERRORS,
  REFRESH_TOKEN_MAX_AGE_SECONDS
} from '../constants.js';

export async function switchAccountHandler(
  this: FastifyApp,
  req: FastifyRequest,
  reply: FastifyReply
) {
  const { userId } = req.user;
  const { accountId } = req.body as { accountId: number };

  // Проверяем что пользователь имеет доступ к запрошенному аккаунту
  const userIdBig = BigInt(userId);
  const account = await this.prisma.account.findFirst({
    where: {
      id: accountId,
      OR: [{ ownerId: userIdBig }, { users: { some: { userId: userIdBig } } }]
    }
  });

  if (!account) {
    return reply.code(403).send(AUTH_ERRORS.FORBIDDEN);
  }

  // Перевыпускаем токены с новым accountId
  const accessToken = await reply.accessJwtSign({ userId, accountId });
  const refreshToken = await reply.refreshJwtSign({
    userId,
    accountId,
    type: 'refresh'
  });

  return reply
    .setCookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS
    })
    .setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth',
      maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS
    })
    .send({ success: true });
}
