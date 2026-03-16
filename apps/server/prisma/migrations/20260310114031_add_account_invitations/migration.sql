-- CreateTable
CREATE TABLE "AccountInvitation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "accountId" INTEGER NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "usedBy" INTEGER,
    CONSTRAINT "AccountInvitation_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountInvitation_code_key" ON "AccountInvitation"("code");
