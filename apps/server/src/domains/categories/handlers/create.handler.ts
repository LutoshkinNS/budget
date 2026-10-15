import type { FastifyReply, FastifyRequest } from 'fastify';

import type { FastifyApp } from '#src/appInit.js';

import { normalizeCategoryName } from '../helpers/category-name.js';
import { serializeCategory } from '../helpers/category-serializer.js';
import {
  createCategory,
  findActiveCategoryDuplicate
} from '../repositories/categories.repository.js';
import type { CategoryCreateBody } from '../types/category.js';

import { CATEGORY_CONFLICT } from './errors.js';

export async function createCategoryHandler(
  this: FastifyApp,
  req: FastifyRequest<{ Body: CategoryCreateBody }>,
  reply: FastifyReply
) {
  const accountId = req.user.accountId;
  const name = req.body.name.trim();
  const nameNormalized = normalizeCategoryName(req.body.name);
  const existing = await findActiveCategoryDuplicate(this.prisma, {
    accountId,
    type: req.body.type,
    nameNormalized
  });
  if (existing) return reply.code(409).send(CATEGORY_CONFLICT);

  const category = await createCategory(this.prisma, {
    accountId,
    name,
    nameNormalized,
    type: req.body.type,
    iconKey: req.body.iconKey ?? null
  });
  return serializeCategory(category);
}
