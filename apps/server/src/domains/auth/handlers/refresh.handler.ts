import type { FastifyReply, FastifyRequest } from 'fastify';

import { ACCESS_TOKEN_MAX_AGE_SECONDS } from '../constants.js';

export async function refreshHandler(req: FastifyRequest, reply: FastifyReply) {
  await req.refreshJwtVerify();

  const { userId, accountId } = req.user;

  const accessToken = await reply.accessJwtSign({ userId, accountId });
  const secureCookies = process.env.NODE_ENV === 'production';

  req.log.info({
    event: 'auth_refresh_success',
    secureCookies,
    accessTokenCookiePath: '/',
    accessTokenMaxAgeSeconds: ACCESS_TOKEN_MAX_AGE_SECONDS
  });

  return reply
    .setCookie('accessToken', accessToken, {
      httpOnly: true,
      secure: secureCookies,
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS
    })
    .send({ success: true });
}
