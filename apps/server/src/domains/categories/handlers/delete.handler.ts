import type { FastifyReply, FastifyRequest } from 'fastify';

import type { FastifyApp } from '#src/appInit.js';

import { softDeleteCategory } from '../repositories/categories.repository.js';
import type { CategoryParams } from '../types/category.js';

export async function deleteCategoryHandler(
  this: FastifyApp,
  req: FastifyRequest<{ Params: CategoryParams }>,
  reply: FastifyReply
) {
  await softDeleteCategory(
    this.prisma,
    { id: req.params.id, accountId: req.user.accountId },
    new Date()
  );
  return reply.code(204).send(null);
}
