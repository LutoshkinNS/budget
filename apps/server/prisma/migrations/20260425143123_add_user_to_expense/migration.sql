-- Step 1: добавляем колонку nullable
ALTER TABLE "Expense" ADD COLUMN "userId" BIGINT;

-- Step 2: backfill — owner соответствующего аккаунта
UPDATE "Expense"
SET "userId" = (
    SELECT "ownerId" FROM "Account" WHERE "Account"."id" = "Expense"."accountId"
);

-- Step 3: rebuild таблицы с NOT NULL и FK на User
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Expense" (
    "id"          INTEGER PRIMARY KEY AUTOINCREMENT,
    "accountId"   INTEGER NOT NULL,
    "categoryId"  INTEGER NOT NULL,
    "userId"      BIGINT  NOT NULL,
    "amount"      REAL    NOT NULL,
    "description" TEXT,
    "date"        DATETIME NOT NULL,
    CONSTRAINT "Expense_accountId_fkey"  FOREIGN KEY ("accountId")  REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Expense_userId_fkey"     FOREIGN KEY ("userId")     REFERENCES "User" ("id")     ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_Expense" ("id","accountId","categoryId","userId","amount","description","date")
SELECT "id","accountId","categoryId","userId","amount","description","date"
FROM "Expense";

DROP TABLE "Expense";
ALTER TABLE "new_Expense" RENAME TO "Expense";

PRAGMA foreign_keys=ON;
