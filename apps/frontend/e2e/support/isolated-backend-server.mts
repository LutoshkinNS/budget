import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

import appInit, { type FastifyApp } from "../../../server/src/appInit.js";
import accountsRoutes from "../../../server/src/domains/accounts/routes.js";
import authRoutes from "../../../server/src/domains/auth/routes.js";
import categoriesModule from "../../../server/src/domains/categories/categories.js";
import transactionsModule from "../../../server/src/domains/transactions/transactions.js";

export function prepareDatabase(excludedMigrations: readonly string[] = []) {
  const temporaryDirectory = process.env.E2E_TEST_DIRECTORY;
  const serverRoot = process.env.E2E_SERVER_ROOT;
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
  function copyMigration(entry: string) {
    cpSync(
      join(migrationRoot, entry),
      join(schemaDirectory, "migrations", entry),
      { recursive: true },
    );
  }
  for (const entry of readdirSync(migrationRoot)) {
    if (!excludedMigrations.includes(entry)) copyMigration(entry);
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
  return { copyMigration, migrate };
}

export async function createTestApp() {
  const app = await appInit();
  await app.prisma.user.create({ data: { id: 1n, firstName: "Тест" } });
  const account = await app.prisma.account.create({
    data: {
      name: "Тестовый бюджет",
      // Исторические операции должны попадать в баланс после начала учёта.
      initialBalanceDate: new Date("2000-01-01T00:00:00.000Z"),
      ownerId: 1n,
      users: { create: { userId: 1n } },
    },
  });
  return { app, account };
}

export async function startTestApp(
  app: FastifyApp,
  metadata: Record<string, unknown> = {},
) {
  await app.register(authRoutes, { prefix: "/api/v1/auth" });
  await app.register(accountsRoutes, { prefix: "/api/v1/accounts" });
  await app.register(categoriesModule, { prefix: "/api/v1/categories" });
  await app.register(transactionsModule, { prefix: "/api/v1/transactions" });
  const url = await app.listen({ port: 0, host: "127.0.0.1" });
  console.log("E2E_BACKEND_READY=" + JSON.stringify({ url, ...metadata }));
  process.stdin.once("data", async () => {
    await app.close();
    await app.prisma.$disconnect();
    process.exit(0);
  });
}
