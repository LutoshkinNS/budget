-- Rename expense/category tables to the unified transaction model names.
-- The rebuilds below refresh SQLite foreign key definitions after the rename.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

ALTER TABLE "Category" RENAME TO "TransactionCategory";
ALTER TABLE "Expense" RENAME TO "Transaction";

DROP INDEX IF EXISTS "Category_accountId_nameNormalized_idx";
DROP INDEX IF EXISTS "Category_active_accountId_nameNormalized_key";

ALTER TABLE "TransactionCategory" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'expense';
ALTER TABLE "Transaction" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'expense';

CREATE TABLE "new_TransactionCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accountId" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'expense',
    "name" TEXT NOT NULL,
    "nameNormalized" TEXT NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "TransactionCategory_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_TransactionCategory" ("id", "accountId", "type", "name", "nameNormalized", "deletedAt")
SELECT "id", "accountId", "type", "name", "nameNormalized", "deletedAt"
FROM "TransactionCategory";

DROP TABLE "TransactionCategory";
ALTER TABLE "new_TransactionCategory" RENAME TO "TransactionCategory";

CREATE TABLE "new_Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accountId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "userId" BIGINT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'expense',
    "amount" REAL NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL,
    CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TransactionCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_Transaction" ("id", "accountId", "categoryId", "userId", "type", "amount", "description", "date")
SELECT "id", "accountId", "categoryId", "userId", "type", "amount", "description", "date"
FROM "Transaction";

DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";

CREATE TABLE "new_Subcategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Subcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TransactionCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_Subcategory" ("id", "categoryId", "name", "deletedAt")
SELECT "id", "categoryId", "name", "deletedAt"
FROM "Subcategory";

DROP TABLE "Subcategory";
ALTER TABLE "new_Subcategory" RENAME TO "Subcategory";

CREATE INDEX "TransactionCategory_accountId_type_nameNormalized_idx"
ON "TransactionCategory"("accountId", "type", "nameNormalized");

CREATE UNIQUE INDEX "TransactionCategory_active_accountId_type_nameNormalized_key"
ON "TransactionCategory"("accountId", "type", "nameNormalized")
WHERE "deletedAt" IS NULL;

CREATE INDEX "Transaction_accountId_date_idx"
ON "Transaction"("accountId", "date");

CREATE INDEX "Transaction_accountId_type_date_idx"
ON "Transaction"("accountId", "type", "date");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
