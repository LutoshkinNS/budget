import type { FastifyRequest } from 'fastify';

import type { FastifyApp } from '#src/appInit.js';

import { serializeCategory } from '../helpers/category-serializer.js';
import { getActiveCategory } from '../repositories/categories.repository.js';
import type { CategoryParams } from '../types/category.js';

export async function getCategoryHandler(
  this: FastifyApp,
  req: FastifyRequest<{ Params: CategoryParams }>
) {
  const category = await getActiveCategory(this.prisma, {
    id: req.params.id,
    accountId: req.user.accountId
  });
  return serializeCategory(category);
}
