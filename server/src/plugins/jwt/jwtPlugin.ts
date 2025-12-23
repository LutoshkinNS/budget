import fastifyJwt from '@fastify/jwt';
import fp from 'fastify-plugin';

import type { FastifyApp } from '#src/appInit.ts';

const accessTokenMessages = {
  badRequestErrorMessage: 'Неверный формат access токена',
  badCookieRequestErrorMessage: 'Access токен не может быть прочитан из cookie',
  noAuthorizationInCookieMessage: 'Access токен не найден в cookies',
  authorizationTokenExpiredMessage: 'Access токен истёк',
  authorizationTokenInvalid: (err: Error) =>
    `Access токен невалиден: ${err.message}`,
  authorizationTokenUntrusted: 'Access токен не является доверенным'
};

const refreshTokenMessages = {
  badRequestErrorMessage: 'Неверный формат refresh токена',
  badCookieRequestErrorMessage:
    'Refresh токен не может быть прочитан из cookie',
  noAuthorizationInCookieMessage: 'Refresh токен не найден в cookies',
  authorizationTokenExpiredMessage: 'Refresh токен истёк',
  authorizationTokenInvalid: (err: Error) =>
    `Refresh токен невалиден: ${err.message}`,
  authorizationTokenUntrusted: 'Refresh токен не является доверенным'
};

async function jwtPlugin(app: FastifyApp) {
  // Access token JWT
  await app.register(fastifyJwt, {
    secret: app.envs.JWT_SECRET,
    namespace: 'accessJwt',
    jwtVerify: 'accessJwtVerify',
    jwtSign: 'accessJwtSign',
    cookie: {
      cookieName: 'accessToken',
      signed: false
    },
    messages: accessTokenMessages
  });

  // Refresh token JWT
  await app.register(fastifyJwt, {
    secret: app.envs.JWT_SECRET,
    namespace: 'refreshJwt',
    jwtVerify: 'refreshJwtVerify',
    jwtSign: 'refreshJwtSign',
    cookie: {
      cookieName: 'refreshToken',
      signed: false
    },
    messages: refreshTokenMessages
  });

  app.decorate('authenticate', async function (request) {
    await request.accessJwtVerify();
  });
}

export default fp(jwtPlugin);
