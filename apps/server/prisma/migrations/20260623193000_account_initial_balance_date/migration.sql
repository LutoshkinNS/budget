PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "initialBalance" REAL NOT NULL DEFAULT 0,
    "initialBalanceDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" BIGINT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Account_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_Account" ("id", "name", "initialBalance", "initialBalanceDate", "ownerId", "createdAt")
SELECT "id", "name", "initialBalance", CURRENT_TIMESTAMP, "ownerId", "createdAt"
FROM "Account";

DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
