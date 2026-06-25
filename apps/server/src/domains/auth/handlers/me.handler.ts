import type { FastifyRequest } from 'fastify';

import type { FastifyApp } from '#src/appInit.js';

import { getUserInfo } from '../repositories/user.repository.js';

export async function meHandler(this: FastifyApp, req: FastifyRequest) {
  req.log.info(
    {
      event: 'auth_me_request',
      hasCookieHeader: Boolean(req.headers.cookie),
      hasRefreshTokenCookie: Boolean(req.cookies?.refreshToken),
      userAgent: req.headers['user-agent'],
      origin: req.headers.origin,
      referer: req.headers.referer
    },
    'auth_request'
  );

  return getUserInfo(this.prisma, req.user.userId, req.user.accountId);
}
