import type { FastifyReply, FastifyRequest } from 'fastify';

import type { FastifyApp } from '#src/appInit.js';

import {
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  AUTH_ERRORS,
  REFRESH_TOKEN_MAX_AGE_SECONDS
} from '../constants.js';
import {
  findOrCreateUser,
  getFirstAccountId
} from '../repositories/user.repository.js';

const DEV_USER_ID = BigInt(1);

export async function devLoginHandler(
  this: FastifyApp,
  _req: FastifyRequest,
  reply: FastifyReply
) {
  const user = await findOrCreateUser(this.prisma, DEV_USER_ID);
  const accountId = getFirstAccountId(user);

  if (!accountId) {
    return reply.code(409).send(AUTH_ERRORS.NO_ACCOUNT);
  }

  const userId = Number(user.id);
  const accessToken = await reply.accessJwtSign({ userId, accountId });
  const refreshToken = await reply.refreshJwtSign({
    userId,
    accountId,
    type: 'refresh'
  });

  return reply
    .setCookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS
    })
    .setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/api/v1/auth',
      maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS
    })
    .send({ success: true });
}