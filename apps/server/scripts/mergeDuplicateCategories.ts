import { PrismaClient } from '../generated/prisma/index.js';
import { normalizeCategoryName } from '../src/domains/categories/categoryName.js';

const prisma = new PrismaClient();
const dryRun = process.argv.includes('--dry-run');

async function main() {
  const categories = await prisma.transactionCategory.findMany({
    where: { deletedAt: null },
    orderBy: [{ accountId: 'asc' }, { type: 'asc' }, { id: 'asc' }]
  });

  const groups = new Map<string, typeof categories>();

  for (const category of categories) {
    const normalizedName = normalizeCategoryName(category.name);
    const key = `${category.accountId}:${category.type}:${normalizedName}`;
    groups.set(key, [...(groups.get(key) ?? []), category]);
  }

  for (const [key, group] of groups) {
    if (group.length < 2) {
      continue;
    }

    const [canonical, ...duplicates] = group;
    const duplicateIds = duplicates.map((category) => category.id);

    console.log(
      `${dryRun ? '[dry-run]' : '[merge]'} ${key}: keep ${canonical.id}, merge ${duplicateIds.join(', ')}`
    );

    if (dryRun) {
      continue;
    }

    await prisma.$transaction(async (tx) => {
      await tx.transaction.updateMany({
        where: { categoryId: { in: duplicateIds } },
        data: { categoryId: canonical.id }
      });

      await tx.subcategory.updateMany({
        where: { categoryId: { in: duplicateIds }, deletedAt: null },
        data: { deletedAt: new Date() }
      });

      await tx.transactionCategory.updateMany({
        where: { id: { in: duplicateIds } },
        data: { deletedAt: new Date() }
      });
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
