-- Account Center: extended profile, 2FA, sessions, api keys, integrations, exports, login events

-- AlterTable: User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "profile" JSONB;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorSecret" TEXT;

-- AlterTable: Subscription
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable: UserSession
CREATE TABLE IF NOT EXISTS "UserSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "device" TEXT,
    "platform" TEXT,
    "ip" TEXT,
    "location" TEXT,
    "userAgent" TEXT,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable: LoginEvent
CREATE TABLE IF NOT EXISTS "LoginEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "method" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable: UserApiKey
CREATE TABLE IF NOT EXISTS "UserApiKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "scopes" JSONB,
    "lastUsed" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "UserApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable: UserIntegration
CREATE TABLE IF NOT EXISTS "UserIntegration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT,
    "credentials" JSONB,
    "metadata" JSONB,
    "isConnected" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable: DataExportRequest
CREATE TABLE IF NOT EXISTS "DataExportRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "format" TEXT NOT NULL DEFAULT 'json',
    "url" TEXT,
    "sizeBytes" INTEGER,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "DataExportRequest_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "UserSession_token_key" ON "UserSession"("token");
CREATE INDEX IF NOT EXISTS "UserSession_userId_idx" ON "UserSession"("userId");
CREATE INDEX IF NOT EXISTS "UserSession_lastActive_idx" ON "UserSession"("lastActive");

CREATE INDEX IF NOT EXISTS "LoginEvent_userId_idx" ON "LoginEvent"("userId");
CREATE INDEX IF NOT EXISTS "LoginEvent_createdAt_idx" ON "LoginEvent"("createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "UserApiKey_keyHash_key" ON "UserApiKey"("keyHash");
CREATE INDEX IF NOT EXISTS "UserApiKey_userId_idx" ON "UserApiKey"("userId");

CREATE UNIQUE INDEX IF NOT EXISTS "UserIntegration_userId_provider_key" ON "UserIntegration"("userId","provider");
CREATE INDEX IF NOT EXISTS "UserIntegration_userId_idx" ON "UserIntegration"("userId");

CREATE INDEX IF NOT EXISTS "DataExportRequest_userId_idx" ON "DataExportRequest"("userId");

-- Foreign keys
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LoginEvent" ADD CONSTRAINT "LoginEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserApiKey" ADD CONSTRAINT "UserApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserIntegration" ADD CONSTRAINT "UserIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DataExportRequest" ADD CONSTRAINT "DataExportRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
