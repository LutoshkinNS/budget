import type { FastifyReply, FastifyRequest } from 'fastify';

import type { FastifyApp } from '#src/app-init.js';

import {
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  REFRESH_TOKEN_MAX_AGE_SECONDS
} from '../constants.js';
import { findOrCreateUser } from '../repositories/user.repository.js';

const DEV_USER_ID = BigInt(1);

export async function devLoginHandler(
  this: FastifyApp,
  _req: FastifyRequest,
  reply: FastifyReply
) {
  const user = await findOrCreateUser(this.prisma, DEV_USER_ID);
  const userId = Number(user.id);
  const accessToken = await reply.accessJwtSign({ userId });
  const refreshToken = await reply.refreshJwtSign({
    userId,
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
