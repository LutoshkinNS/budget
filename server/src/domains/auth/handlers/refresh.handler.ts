import type { FastifyReply, FastifyRequest } from 'fastify';

import { ACCESS_TOKEN_MAX_AGE_SECONDS } from '../constants.ts';

export async function refreshHandler(req: FastifyRequest, reply: FastifyReply) {
  await req.refreshJwtVerify();

  const { userId, accountId } = req.user;

  const accessToken = await reply.accessJwtSign({ userId, accountId });

  return reply
    .setCookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS
    })
    .send({ success: true });
}
