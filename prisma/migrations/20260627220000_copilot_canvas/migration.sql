-- Canvas, Copilot, Scripts — tables present in Prisma schema but missing from production

-- Canvas
CREATE TABLE IF NOT EXISTS "Canvas" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'بوم کسب‌وکار',
    "type" TEXT NOT NULL DEFAULT 'BMC',
    "layout" JSONB,
    "viewport" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Canvas_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Canvas_projectId_idx" ON "Canvas"("projectId");

CREATE TABLE IF NOT EXISTS "Card" (
    "id" TEXT NOT NULL,
    "canvasId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "x" DOUBLE PRECISION,
    "y" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "content" TEXT NOT NULL,
    "cardType" TEXT NOT NULL DEFAULT 'NOTE',
    "color" TEXT NOT NULL DEFAULT 'blue',
    "metadata" JSONB,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Card_canvasId_section_idx" ON "Card"("canvasId", "section");

CREATE TABLE IF NOT EXISTS "Comment" (
    "id" TEXT NOT NULL,
    "canvasId" TEXT NOT NULL,
    "cardId" TEXT,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT,
    "authorAvatar" TEXT,
    "body" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Comment_canvasId_idx" ON "Comment"("canvasId");
CREATE INDEX IF NOT EXISTS "Comment_cardId_idx" ON "Comment"("cardId");

CREATE TABLE IF NOT EXISTS "CanvasVersion" (
    "id" TEXT NOT NULL,
    "canvasId" TEXT NOT NULL,
    "name" TEXT,
    "snapshot" JSONB NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CanvasVersion_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CanvasVersion_canvasId_idx" ON "CanvasVersion"("canvasId");

-- Copilot / personalization
CREATE TABLE IF NOT EXISTS "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT,
    "industry" TEXT,
    "businessStage" TEXT,
    "goals" JSONB,
    "preferredTone" TEXT NOT NULL DEFAULT 'balanced',
    "expertiseLevel" TEXT NOT NULL DEFAULT 'beginner',
    "language" TEXT NOT NULL DEFAULT 'fa',
    "learnedPreferences" JSONB,
    "memoryEntries" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "UserProfile_userId_key" ON "UserProfile"("userId");

CREATE TABLE IF NOT EXISTS "ProjectMemory" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "decisions" JSONB,
    "openQuestions" JSONB,
    "risks" JSONB,
    "keyFacts" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProjectMemory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ProjectMemory_projectId_key" ON "ProjectMemory"("projectId");

CREATE TABLE IF NOT EXISTS "ChatConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'cofounder',
    "persona" TEXT,
    "model" TEXT,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "lastMessagePreview" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ChatConversation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ChatConversation_userId_idx" ON "ChatConversation"("userId");
CREATE INDEX IF NOT EXISTS "ChatConversation_projectId_idx" ON "ChatConversation"("projectId");
CREATE INDEX IF NOT EXISTS "ChatConversation_pinned_idx" ON "ChatConversation"("pinned");

CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "toolCalls" JSONB,
    "artifacts" JSONB,
    "followUps" JSONB,
    "parentMessageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ChatMessage_conversationId_idx" ON "ChatMessage"("conversationId");
CREATE INDEX IF NOT EXISTS "ChatMessage_parentMessageId_idx" ON "ChatMessage"("parentMessageId");

CREATE TABLE IF NOT EXISTS "AiFeedback" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "rating" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiFeedback_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AiFeedback_messageId_key" ON "AiFeedback"("messageId");

CREATE TABLE IF NOT EXISTS "Artifact" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "conversationId" TEXT,
    "type" TEXT NOT NULL,
    "refId" TEXT,
    "data" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentId" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Artifact_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Artifact_projectId_idx" ON "Artifact"("projectId");
CREATE INDEX IF NOT EXISTS "Artifact_conversationId_idx" ON "Artifact"("conversationId");
CREATE INDEX IF NOT EXISTS "Artifact_type_idx" ON "Artifact"("type");

CREATE TABLE IF NOT EXISTS "AiActionLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "conversationId" TEXT,
    "toolName" TEXT NOT NULL,
    "args" JSONB,
    "result" JSONB,
    "status" TEXT NOT NULL DEFAULT 'success',
    "undoPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiActionLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AiActionLog_userId_idx" ON "AiActionLog"("userId");
CREATE INDEX IF NOT EXISTS "AiActionLog_projectId_idx" ON "AiActionLog"("projectId");

CREATE TABLE IF NOT EXISTS "AiInsight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'info',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "payload" JSONB,
    "actionPayload" JSONB,
    "status" TEXT NOT NULL DEFAULT 'unread',
    "snoozedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AiInsight_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AiInsight_userId_idx" ON "AiInsight"("userId");
CREATE INDEX IF NOT EXISTS "AiInsight_projectId_idx" ON "AiInsight"("projectId");
CREATE INDEX IF NOT EXISTS "AiInsight_status_idx" ON "AiInsight"("status");

CREATE TABLE IF NOT EXISTS "AiUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "conversationId" TEXT,
    "model" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'openrouter',
    "feature" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "costUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiUsage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AiUsage_userId_idx" ON "AiUsage"("userId");
CREATE INDEX IF NOT EXISTS "AiUsage_projectId_idx" ON "AiUsage"("projectId");
CREATE INDEX IF NOT EXISTS "AiUsage_createdAt_idx" ON "AiUsage"("createdAt");

CREATE TABLE IF NOT EXISTS "CustomerBotChannel" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "provider" TEXT NOT NULL,
    "credentials" JSONB,
    "config" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CustomerBotChannel_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CustomerBotChannel_userId_provider_key" ON "CustomerBotChannel"("userId", "provider");
CREATE INDEX IF NOT EXISTS "CustomerBotChannel_userId_idx" ON "CustomerBotChannel"("userId");

CREATE TABLE IF NOT EXISTS "CustomerBotConversation" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "customerName" TEXT,
    "customerHandle" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "lastMessagePreview" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CustomerBotConversation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CustomerBotConversation_channelId_idx" ON "CustomerBotConversation"("channelId");
CREATE INDEX IF NOT EXISTS "CustomerBotConversation_status_idx" ON "CustomerBotConversation"("status");

CREATE TABLE IF NOT EXISTS "CustomerBotMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "externalId" TEXT,
    "metadata" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomerBotMessage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CustomerBotMessage_conversationId_idx" ON "CustomerBotMessage"("conversationId");

CREATE TABLE IF NOT EXISTS "Script" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "scenes" JSONB,
    "template" TEXT NOT NULL DEFAULT 'viral-hook',
    "duration" TEXT NOT NULL DEFAULT '60s',
    "audience" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "folder" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Script_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Script_projectId_idx" ON "Script"("projectId");

-- Foreign keys (idempotent)
DO $$ BEGIN ALTER TABLE "Canvas" ADD CONSTRAINT "Canvas_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "Card" ADD CONSTRAINT "Card_canvasId_fkey" FOREIGN KEY ("canvasId") REFERENCES "Canvas"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "Comment" ADD CONSTRAINT "Comment_canvasId_fkey" FOREIGN KEY ("canvasId") REFERENCES "Canvas"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "CanvasVersion" ADD CONSTRAINT "CanvasVersion_canvasId_fkey" FOREIGN KEY ("canvasId") REFERENCES "Canvas"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "ProjectMemory" ADD CONSTRAINT "ProjectMemory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "ChatConversation" ADD CONSTRAINT "ChatConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "ChatConversation" ADD CONSTRAINT "ChatConversation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_parentMessageId_fkey" FOREIGN KEY ("parentMessageId") REFERENCES "ChatMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "AiFeedback" ADD CONSTRAINT "AiFeedback_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "Artifact" ADD CONSTRAINT "Artifact_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "Artifact" ADD CONSTRAINT "Artifact_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "AiActionLog" ADD CONSTRAINT "AiActionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "AiActionLog" ADD CONSTRAINT "AiActionLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "AiActionLog" ADD CONSTRAINT "AiActionLog_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "AiInsight" ADD CONSTRAINT "AiInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "AiInsight" ADD CONSTRAINT "AiInsight_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "AiUsage" ADD CONSTRAINT "AiUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "AiUsage" ADD CONSTRAINT "AiUsage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "CustomerBotChannel" ADD CONSTRAINT "CustomerBotChannel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "CustomerBotChannel" ADD CONSTRAINT "CustomerBotChannel_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "CustomerBotConversation" ADD CONSTRAINT "CustomerBotConversation_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "CustomerBotChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "CustomerBotMessage" ADD CONSTRAINT "CustomerBotMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "CustomerBotConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "Script" ADD CONSTRAINT "Script_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
