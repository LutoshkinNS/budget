import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

import appInit from "../../../server/src/appInit.js";
import authRoutes from "../../../server/src/domains/auth/routes.js";
import categoriesModule from "../../../server/src/domains/categories/categories.js";
import transactionsModule from "../../../server/src/domains/transactions/transactions.js";

const temporaryDirectory = process.env.CATEGORY_ICONS_TEST_DIRECTORY;
const serverRoot = process.env.CATEGORY_ICONS_SERVER_ROOT;
if (!temporaryDirectory || !serverRoot)
  throw new Error("Isolated test directory is required");
const require = createRequire(join(serverRoot, "package.json"));
const schemaDirectory = join(temporaryDirectory, "prisma");
mkdirSync(join(schemaDirectory, "migrations"), { recursive: true });
cpSync(
  join(serverRoot, "prisma/schema.prisma"),
  join(schemaDirectory, "schema.prisma"),
);
const migrationRoot = join(serverRoot, "prisma/migrations");
const iconMigration = "20261007180000_category_icon_key";
for (const entry of readdirSync(migrationRoot)) {
  if (entry !== iconMigration)
    cpSync(
      join(migrationRoot, entry),
      join(schemaDirectory, "migrations", entry),
      { recursive: true },
    );
}
function migrate() {
  execFileSync(
    process.execPath,
    [
      require.resolve("prisma/build/index.js"),
      "migrate",
      "deploy",
      "--schema",
      join(schemaDirectory, "schema.prisma"),
    ],
    { env: process.env, stdio: "pipe" },
  );
}
migrate();
const app = await appInit();
await app.prisma.user.create({ data: { id: 1n, firstName: "Тест" } });
const account = await app.prisma.account.create({
  data: {
    name: "Тестовый бюджет",
    ownerId: 1n,
    users: { create: { userId: 1n } },
  },
});
// Создаём старую категорию до миграции iconKey, проверяя отсутствие backfill.
await app.prisma
  .$executeRaw`INSERT INTO "TransactionCategory" ("accountId", "type", "name", "nameNormalized")
  VALUES (${account.id}, 'expense', 'Старая категория', 'старая категория')`;
cpSync(
  join(migrationRoot, iconMigration),
  join(schemaDirectory, "migrations", iconMigration),
  { recursive: true },
);
migrate();
const legacy = await app.prisma.transactionCategory.findFirstOrThrow({
  where: { accountId: account.id },
});
assert.equal(legacy.iconKey, null);
await app.register(authRoutes, { prefix: "/api/v1/auth" });
await app.register(categoriesModule, { prefix: "/api/v1/categories" });
await app.register(transactionsModule, { prefix: "/api/v1/transactions" });
const url = await app.listen({ port: 0, host: "127.0.0.1" });
console.log(
  "CATEGORY_ICONS_READY=" + JSON.stringify({ url, legacyId: legacy.id }),
);
process.stdin.once("data", async () => {
  await app.close();
  await app.prisma.$disconnect();
  process.exit(0);
});
