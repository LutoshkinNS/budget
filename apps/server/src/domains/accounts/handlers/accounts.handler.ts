import type { FastifyRequest } from 'fastify';

import type { FastifyApp } from '#src/appInit.js';

import { getAccountsList } from '../repositories/accounts.repository.js';

export async function accountsHandler(this: FastifyApp, req: FastifyRequest) {
  return getAccountsList(this.prisma, req.user.userId);
}
