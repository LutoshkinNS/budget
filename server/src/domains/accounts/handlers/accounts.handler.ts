import type { FastifyRequest } from 'fastify';

import type { FastifyApp } from '#src/appInit.ts';

import { getAccountsList } from '../repositories/accounts.repository.ts';

export async function accountsHandler(this: FastifyApp, req: FastifyRequest) {
  return getAccountsList(this.prisma, req.user.userId);
}
