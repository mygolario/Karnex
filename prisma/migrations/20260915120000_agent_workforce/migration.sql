-- Executing cofounder workforce: durable agent runs with founder approval.

CREATE TABLE IF NOT EXISTS "AgentRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'dispatch',
    "status" TEXT NOT NULL DEFAULT 'running',
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "output" JSONB NOT NULL,
    "error" TEXT,
    "appliedAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AgentRun_projectId_createdAt_idx" ON "AgentRun"("projectId", "createdAt");
CREATE INDEX IF NOT EXISTS "AgentRun_userId_createdAt_idx" ON "AgentRun"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "AgentRun_projectId_status_idx" ON "AgentRun"("projectId", "status");
CREATE INDEX IF NOT EXISTS "AgentRun_agentId_idx" ON "AgentRun"("agentId");

ALTER TABLE "AgentRun"
    ADD CONSTRAINT "AgentRun_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AgentRun"
    ADD CONSTRAINT "AgentRun_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AgentRun" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "AgentRun" FROM anon, authenticated;
