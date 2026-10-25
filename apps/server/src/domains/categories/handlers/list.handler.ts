import type { FastifyRequest } from 'fastify';

import type { FastifyApp } from '#src/appInit.js';

import { serializeCategory } from '../helpers/category-serializer.js';
import { orderCategoriesByUsage } from '../helpers/category-usage.js';
import {
  countCategoryUsage,
  findActiveCategories
} from '../repositories/categories.repository.js';
import type { AccountParams,CategoryListQuery } from '../types/category.js';

export async function listCategoriesHandler(
  this: FastifyApp,
  req: FastifyRequest<{ Querystring: CategoryListQuery; Params: AccountParams }>
) {
  const filter = { accountId: req.params.accountId, type: req.query.type };
  if (req.query.sort === 'usage') {
    const now = new Date();
    const from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const [categories, usageCounts] = await Promise.all([
      findActiveCategories(this.prisma, filter),
      countCategoryUsage(this.prisma, {
        ...filter,
        userId: req.user.userId,
        from,
        to: now
      })
    ]);
    return orderCategoriesByUsage(categories, usageCounts).map(
      serializeCategory
    );
  }

  return (await findActiveCategories(this.prisma, filter)).map(
    serializeCategory
  );
}
