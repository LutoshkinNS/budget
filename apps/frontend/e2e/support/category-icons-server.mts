import assert from "node:assert/strict";

import {
  createTestApp,
  prepareDatabase,
  startTestApp,
} from "./isolated-backend-server.mts";

const iconMigration = "20261007180000_category_icon_key";
const database = prepareDatabase([iconMigration]);
const { app, account } = await createTestApp();
// Создаём старую категорию до миграции iconKey, проверяя отсутствие backfill.
await app.prisma
  .$executeRaw`INSERT INTO "TransactionCategory" ("accountId", "type", "name", "nameNormalized")
  VALUES (${account.id}, 'expense', 'Старая категория', 'старая категория')`;
database.copyMigration(iconMigration);
database.migrate();
const legacy = await app.prisma.transactionCategory.findFirstOrThrow({
  where: { accountId: account.id },
});
assert.equal(legacy.iconKey, null);
await startTestApp(app, { legacyId: legacy.id });
