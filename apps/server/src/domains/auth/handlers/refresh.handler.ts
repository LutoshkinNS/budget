import type { FastifyReply, FastifyRequest } from 'fastify';

import { ACCESS_TOKEN_MAX_AGE_SECONDS } from '../constants.js';

export async function refreshHandler(req: FastifyRequest, reply: FastifyReply) {
  req.log.info(
    {
      event: 'auth_refresh_request',
      hasCookieHeader: Boolean(req.headers.cookie),
      hasRefreshTokenCookie: Boolean(req.cookies?.refreshToken),
      userAgent: req.headers['user-agent'],
      origin: req.headers.origin,
      referer: req.headers.referer
    },
    'auth_request'
  );

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

  const response = reply
    .setCookie('accessToken', accessToken, {
      httpOnly: true,
      secure: secureCookies,
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS
    });

  req.log.info(
    {
      event: 'auth_refresh_response',
      willSetCookieNames: ['accessToken'],
      accessTokenCookiePath: '/'
    },
    'auth_request'
  );

  return response.send({ success: true });
}
