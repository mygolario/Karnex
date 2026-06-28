-- CreateTable
CREATE TABLE "UserOnboarding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '3.0.0',
    "currentStep" TEXT NOT NULL DEFAULT 'profile',
    "profileCompletedAt" TIMESTAMP(3),
    "needsReonboard" BOOLEAN NOT NULL DEFAULT true,
    "profileData" JSONB,
    "gamification" JSONB,
    "completedMissions" JSONB,
    "onboardingCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserOnboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectOnboarding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "currentStep" TEXT NOT NULL DEFAULT 'genesis',
    "pillar" TEXT,
    "projectName" TEXT,
    "projectVision" TEXT,
    "answers" JSONB,
    "audience" TEXT,
    "budget" TEXT,
    "extractedData" JSONB,
    "qualityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "chatTurnsUsed" INTEGER NOT NULL DEFAULT 0,
    "genesisDraft" JSONB,
    "completedMissions" JSONB,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectOnboarding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserOnboarding_userId_key" ON "UserOnboarding"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectOnboarding_projectId_key" ON "ProjectOnboarding"("projectId");

-- CreateIndex
CREATE INDEX "ProjectOnboarding_userId_idx" ON "ProjectOnboarding"("userId");

-- AddForeignKey
ALTER TABLE "UserOnboarding" ADD CONSTRAINT "UserOnboarding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectOnboarding" ADD CONSTRAINT "ProjectOnboarding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectOnboarding" ADD CONSTRAINT "ProjectOnboarding_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
