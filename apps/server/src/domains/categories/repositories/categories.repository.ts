import type { PrismaClient } from '#generated/prisma/index.js';

import type {
  Category,
  CategoryCreateData,
  CategoryFilter,
  CategoryScope,
  CategoryUpdateData,
  StoredCategory
} from '../types/category.js';

export type UpdateCategoryResult =
  | { status: 'updated'; category: StoredCategory }
  | { status: 'not-found' }
  | { status: 'conflict' };

function activeCategoryWhere(scope: CategoryScope) {
  return { id: scope.id, accountId: scope.accountId, deletedAt: null };
}

export async function findActiveCategories(
  prisma: PrismaClient,
  filter: CategoryFilter
): Promise<StoredCategory[]> {
  return prisma.transactionCategory.findMany({
    where: {
      accountId: filter.accountId,
      deletedAt: null,
      ...(filter.type === undefined ? {} : { type: filter.type })
    }
  });
}

export async function getActiveCategory(
  prisma: PrismaClient,
  scope: CategoryScope
): Promise<StoredCategory> {
  return prisma.transactionCategory.findFirstOrThrow({
    where: activeCategoryWhere(scope)
  });
}

export async function findActiveCategory(
  prisma: PrismaClient,
  scope: CategoryScope
): Promise<StoredCategory | null> {
  return prisma.transactionCategory.findFirst({
    where: activeCategoryWhere(scope)
  });
}

export async function findActiveCategoryDuplicate(
  prisma: PrismaClient,
  query: Pick<Category, 'accountId'> & {
    type: StoredCategory['type'];
    nameNormalized: string;
    excludeId?: Category['id'];
  }
): Promise<Pick<Category, 'id'> | null> {
  return prisma.transactionCategory.findFirst({
    where: {
      accountId: query.accountId,
      type: query.type,
      deletedAt: null,
      nameNormalized: query.nameNormalized,
      ...(query.excludeId === undefined ? {} : { id: { not: query.excludeId } })
    },
    select: { id: true }
  });
}

export async function countCategoryUsage(
  prisma: PrismaClient,
  query: CategoryFilter & { userId: number; from: Date; to: Date }
): Promise<Map<Category['id'], number>> {
  const groups = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: {
      accountId: query.accountId,
      userId: BigInt(query.userId),
      date: { gte: query.from, lte: query.to },
      ...(query.type === undefined ? {} : { type: query.type })
    },
    _count: { _all: true }
  });
  return new Map(groups.map((group) => [group.categoryId, group._count._all]));
}

export async function createCategory(
  prisma: PrismaClient,
  data: CategoryCreateData
): Promise<StoredCategory> {
  return prisma.transactionCategory.create({ data });
}

export async function updateActiveCategory(
  prisma: PrismaClient,
  scope: CategoryScope,
  data: CategoryUpdateData
): Promise<UpdateCategoryResult> {
  const where = activeCategoryWhere(scope);
  let result;
  try {
    result = await prisma.transactionCategory.updateMany({ where, data });
  } catch (error) {
    // Предварительная проверка не исключает одновременное переименование.
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return { status: 'conflict' };
    }
    throw error;
  }
  const category =
    result.count > 0
      ? await prisma.transactionCategory.findFirst({ where })
      : null;
  return category === null
    ? { status: 'not-found' }
    : { status: 'updated', category };
}

export async function softDeleteCategory(
  prisma: PrismaClient,
  scope: CategoryScope,
  deletedAt: Date
): Promise<void> {
  await prisma.transactionCategory.updateMany({
    where: activeCategoryWhere(scope),
    data: { deletedAt }
  });
}
