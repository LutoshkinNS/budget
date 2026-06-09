ALTER TABLE "Category" ADD COLUMN "nameNormalized" TEXT NOT NULL DEFAULT '';

UPDATE "Category"
SET "nameNormalized" = lower(trim("name"));

CREATE INDEX "Category_accountId_nameNormalized_idx"
ON "Category"("accountId", "nameNormalized");

CREATE UNIQUE INDEX "Category_active_accountId_nameNormalized_key"
ON "Category"("accountId", "nameNormalized")
WHERE "deletedAt" IS NULL;
