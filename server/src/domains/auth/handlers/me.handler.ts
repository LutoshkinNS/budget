import type { FastifyRequest } from 'fastify';

import type { FastifyApp } from '#src/appInit.js';

import { getUserInfo } from '../repositories/user.repository.js';

export async function meHandler(this: FastifyApp, req: FastifyRequest) {
  return getUserInfo(this.prisma, req.user.userId, req.user.accountId);
}
