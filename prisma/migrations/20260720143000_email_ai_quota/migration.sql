-- Email-keyed AI usage ledger: carry free monthly credits across delete → re-signup

CREATE TABLE IF NOT EXISTS "EmailAiQuota" (
    "emailHash" TEXT NOT NULL,
    "aiRequests" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EmailAiQuota_pkey" PRIMARY KEY ("emailHash")
);
