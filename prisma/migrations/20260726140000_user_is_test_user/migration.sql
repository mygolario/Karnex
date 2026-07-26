-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isTestUser" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_isTestUser_idx" ON "User"("isTestUser");
