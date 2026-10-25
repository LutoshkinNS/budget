import type { FastifyReply, FastifyRequest } from 'fastify';

import type { FastifyApp } from '#src/appInit.js';

import { serializeCategory } from '../helpers/category-serializer.js';
import { findActiveCategory } from '../repositories/categories.repository.js';
import type { CategoryParams } from '../types/category.js';

import { CATEGORY_NOT_FOUND } from './errors.js';

export async function getCategoryHandler(
  this: FastifyApp,
  req: FastifyRequest<{ Params: CategoryParams }>,
  reply: FastifyReply
) {
  // Сущность вне счёта из path неотличима от отсутствующей — 404, не 500
  const category = await findActiveCategory(this.prisma, {
    id: req.params.id,
    accountId: req.params.accountId
  });
  if (!category) return reply.code(404).send(CATEGORY_NOT_FOUND);
  return serializeCategory(category);
}
