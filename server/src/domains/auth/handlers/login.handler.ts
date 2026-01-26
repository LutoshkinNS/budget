import type { FastifyReply, FastifyRequest } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';

import type LoginRequest from '#s/LoginRequest.js';
import type { FastifyApp } from '#src/appInit.js';

import {
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  AUTH_DATA_MAX_AGE_SECONDS,
  AUTH_ERRORS,
  REFRESH_TOKEN_MAX_AGE_SECONDS
} from '../constants.js';
import {
  findOrCreateUser,
  getFirstAccountId
} from '../repositories/user.repository.js';
import { validateTelegramAuth } from '../validateTelegramAuth.js';

type LoginRequestBody = FromSchema<typeof LoginRequest>;

export async function loginHandler(
  this: FastifyApp,
  req: FastifyRequest<{ Body: LoginRequestBody }>,
  reply: FastifyReply
) {
  const isValid = validateTelegramAuth(req.body, this.envs.TELEGRAM_BOT_TOKEN);

  if (!isValid) {
    return reply.code(401).send(AUTH_ERRORS.INVALID_TELEGRAM_AUTH);
  }

  // Проверяем что данные не старше 24 часов
  const authDate = req.body.auth_date;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  if (currentTimestamp - authDate > AUTH_DATA_MAX_AGE_SECONDS) {
    return reply.code(401).send(AUTH_ERRORS.AUTH_DATA_EXPIRED);
  }

  const userId = req.body.id;

  // Ищем или создаём пользователя
  const user = await findOrCreateUser(this.prisma, userId);

  // Определяем первый доступный accountId
  const accountId = getFirstAccountId(user);

  if (!accountId) {
    return reply.code(409).send(AUTH_ERRORS.NO_ACCOUNT);
  }

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
