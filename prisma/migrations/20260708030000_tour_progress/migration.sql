-- Product Tour rework: server-backed progress so tours survive device/browser changes.

CREATE TABLE IF NOT EXISTS "TourProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "completedTours" JSONB NOT NULL DEFAULT '[]',
    "skippedTours" JSONB NOT NULL DEFAULT '[]',
    "completedChecklistItems" JSONB NOT NULL DEFAULT '[]',
    "dismissedBeacons" JSONB NOT NULL DEFAULT '[]',
    "persona" TEXT,
    "experienceLevel" TEXT,
    "primaryGoal" TEXT,
    "hasSeenWelcome" BOOLEAN NOT NULL DEFAULT false,
    "disableAutoStart" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenWhatsNewVersion" TEXT,
    "lastKnownProjectType" TEXT,
    "lastKnownPlan" TEXT,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TourProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TourProgress_userId_key" ON "TourProgress"("userId");
CREATE INDEX IF NOT EXISTS "TourProgress_userId_idx" ON "TourProgress"("userId");

DO $$ BEGIN
  ALTER TABLE "TourProgress" ADD CONSTRAINT "TourProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
