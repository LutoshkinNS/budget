import { PrismaClient } from '#generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  const duplicatesBefore = await prisma.$queryRawUnsafe(`
    SELECT
      "accountId",
      lower(trim("name")) AS "normalized",
      COUNT(*) AS "count",
      group_concat("id") AS "ids",
      group_concat("name") AS "names"
    FROM "Category"
    WHERE "deletedAt" IS NULL
    GROUP BY "accountId", lower(trim("name"))
    HAVING COUNT(*) > 1
  `);

  console.log('Duplicates before repair:');
  console.dir(duplicatesBefore, { depth: null });

  const columns = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
    'PRAGMA table_info("Category")'
  );

  if (!columns.some((column) => column.name === 'nameNormalized')) {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "Category" ADD COLUMN "nameNormalized" TEXT NOT NULL DEFAULT \'\''
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`
      UPDATE "Expense"
      SET "categoryId" = (
        SELECT MIN("canonical"."id")
        FROM "Category" AS "canonical"
        WHERE "canonical"."accountId" = (
          SELECT "duplicate"."accountId"
          FROM "Category" AS "duplicate"
          WHERE "duplicate"."id" = "Expense"."categoryId"
        )
          AND "canonical"."deletedAt" IS NULL
          AND lower(trim("canonical"."name")) = (
            SELECT lower(trim("duplicate"."name"))
            FROM "Category" AS "duplicate"
            WHERE "duplicate"."id" = "Expense"."categoryId"
          )
      )
      WHERE "categoryId" IN (
        SELECT "duplicate"."id"
        FROM "Category" AS "duplicate"
        WHERE "duplicate"."deletedAt" IS NULL
          AND "duplicate"."id" <> (
            SELECT MIN("canonical"."id")
            FROM "Category" AS "canonical"
            WHERE "canonical"."accountId" = "duplicate"."accountId"
              AND "canonical"."deletedAt" IS NULL
              AND lower(trim("canonical"."name")) = lower(trim("duplicate"."name"))
          )
      )
    `);

    await tx.$executeRawUnsafe(`
      UPDATE "Subcategory"
      SET "deletedAt" = CURRENT_TIMESTAMP
      WHERE "deletedAt" IS NULL
        AND "categoryId" IN (
          SELECT "duplicate"."id"
          FROM "Category" AS "duplicate"
          WHERE "duplicate"."deletedAt" IS NULL
            AND "duplicate"."id" <> (
              SELECT MIN("canonical"."id")
              FROM "Category" AS "canonical"
              WHERE "canonical"."accountId" = "duplicate"."accountId"
                AND "canonical"."deletedAt" IS NULL
                AND lower(trim("canonical"."name")) = lower(trim("duplicate"."name"))
            )
        )
    `);

    await tx.$executeRawUnsafe(`
      UPDATE "Category"
      SET "deletedAt" = CURRENT_TIMESTAMP
      WHERE "deletedAt" IS NULL
        AND "id" <> (
          SELECT MIN("canonical"."id")
          FROM "Category" AS "canonical"
          WHERE "canonical"."accountId" = "Category"."accountId"
            AND "canonical"."deletedAt" IS NULL
            AND lower(trim("canonical"."name")) = lower(trim("Category"."name"))
        )
    `);

    await tx.$executeRawUnsafe(`
      UPDATE "Category"
      SET "nameNormalized" = lower(trim("name"))
    `);
  });

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Category_accountId_nameNormalized_idx"
    ON "Category"("accountId", "nameNormalized")
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Category_active_accountId_nameNormalized_key"
    ON "Category"("accountId", "nameNormalized")
    WHERE "deletedAt" IS NULL
  `);

  const duplicatesAfter = await prisma.$queryRawUnsafe(`
    SELECT
      "accountId",
      "nameNormalized",
      COUNT(*) AS "count",
      group_concat("id") AS "ids"
    FROM "Category"
    WHERE "deletedAt" IS NULL
    GROUP BY "accountId", "nameNormalized"
    HAVING COUNT(*) > 1
  `);

  console.log('Duplicates after repair:');
  console.dir(duplicatesAfter, { depth: null });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
