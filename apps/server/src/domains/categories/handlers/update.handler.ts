import type { FastifyReply, FastifyRequest } from 'fastify';

import type { FastifyApp } from '#src/app-init.js';

import { normalizeCategoryName } from '../helpers/category-name.js';
import { serializeCategory } from '../helpers/category-serializer.js';
import {
  findActiveCategory,
  findActiveCategoryDuplicate,
  updateActiveCategory
} from '../repositories/categories.repository.js';
import type { CategoryParams, CategoryUpdateBody } from '../types/category.js';

import {
  CATEGORY_CONFLICT,
  CATEGORY_INVALID_UPDATE,
  CATEGORY_NOT_FOUND
} from './errors.js';

export async function updateCategoryHandler(
  this: FastifyApp,
  req: FastifyRequest<{ Params: CategoryParams; Body: CategoryUpdateBody }>,
  reply: FastifyReply
) {
  const name = req.body.name?.trim();
  if ((name === undefined && req.body.iconKey === undefined) || name === '') {
    return reply.code(400).send(CATEGORY_INVALID_UPDATE);
  }
  const scope = { id: req.params.id, accountId: req.params.accountId };
  const existing = await findActiveCategory(this.prisma, scope);
  if (!existing) return reply.code(404).send(CATEGORY_NOT_FOUND);

  const nameNormalized =
    name === undefined ? undefined : normalizeCategoryName(name);
  if (nameNormalized !== undefined) {
    const duplicate = await findActiveCategoryDuplicate(this.prisma, {
      accountId: scope.accountId,
      type: existing.type,
      nameNormalized,
      excludeId: existing.id
    });
    if (duplicate) return reply.code(409).send(CATEGORY_CONFLICT);
  }
  const result = await updateActiveCategory(this.prisma, scope, {
    ...(name === undefined || nameNormalized === undefined
      ? {}
      : { name, nameNormalized }),
    ...(req.body.iconKey === undefined ? {} : { iconKey: req.body.iconKey })
  });
  if (result.status === 'conflict')
    return reply.code(409).send(CATEGORY_CONFLICT);
  if (result.status === 'not-found')
    return reply.code(404).send(CATEGORY_NOT_FOUND);
  return serializeCategory(result.category);
}
