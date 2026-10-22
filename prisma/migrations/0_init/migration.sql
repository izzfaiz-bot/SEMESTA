-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TEACHER');

-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('VIDEO', 'PPT');

-- CreateEnum
CREATE TYPE "QuestionSource" AS ENUM ('WEBSITE', 'TEACHER');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('WAITING', 'ACTIVE', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "authUserId" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'TEACHER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "subtitle" VARCHAR(120),
    "description" TEXT,
    "iconUrl" TEXT,
    "imageUrl" TEXT,
    "imageStoragePath" TEXT,
    "emoji" VARCHAR(20),
    "accentColor" VARCHAR(30),
    "glow" VARCHAR(50),
    "background" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phenomenon" (
    "id" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phenomenon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningMaterial" (
    "id" UUID NOT NULL,
    "phenomenonId" UUID NOT NULL,
    "type" "MaterialType" NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "storagePath" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" UUID NOT NULL,
    "phenomenonId" UUID NOT NULL,
    "createdById" UUID,
    "source" "QuestionSource" NOT NULL DEFAULT 'WEBSITE',
    "text" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "points" INTEGER NOT NULL DEFAULT 1000,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "easyPoints" INTEGER NOT NULL DEFAULT 500,
    "mediumPoints" INTEGER NOT NULL DEFAULT 1000,
    "hardPoints" INTEGER NOT NULL DEFAULT 1500,
    "speedBonusMaxPoints" INTEGER NOT NULL DEFAULT 500,
    "minQuestionSeconds" INTEGER NOT NULL DEFAULT 10,
    "maxQuestionSeconds" INTEGER NOT NULL DEFAULT 60,
    "defaultQuestionSeconds" INTEGER NOT NULL DEFAULT 20,
    "maxRoomParticipants" INTEGER NOT NULL DEFAULT 50,
    "defaultQuestionCount" INTEGER NOT NULL DEFAULT 10,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizSession" (
    "id" UUID NOT NULL,
    "hostId" UUID NOT NULL,
    "categoryId" UUID,
    "phenomenonId" UUID,
    "code" VARCHAR(12) NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'WAITING',
    "maxParticipants" INTEGER NOT NULL DEFAULT 50,
    "questionSeconds" INTEGER NOT NULL DEFAULT 20,
    "speedBonusMaxPoints" INTEGER NOT NULL DEFAULT 500,
    "currentPosition" INTEGER NOT NULL DEFAULT 0,
    "currentQuestionStartedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizSessionQuestion" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "questionTextSnapshot" TEXT NOT NULL,
    "explanationSnapshot" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "points" INTEGER NOT NULL,
    "timeLimitSeconds" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizSessionQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizParticipant" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "nickname" VARCHAR(40) NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "finalScore" INTEGER,
    "finalCorrectCount" INTEGER,
    "finalRank" INTEGER,
    "resultFinalizedAt" TIMESTAMP(3),

    CONSTRAINT "QuizParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAnswer" (
    "id" UUID NOT NULL,
    "participantId" UUID NOT NULL,
    "sessionQuestionId" UUID NOT NULL,
    "selectedOptionId" UUID,
    "selectedOptionText" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "basePoints" INTEGER NOT NULL DEFAULT 0,
    "bonusPoints" INTEGER NOT NULL DEFAULT 0,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "responseTimeMs" INTEGER,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" UUID NOT NULL,
    "nickname" VARCHAR(40),
    "categoryId" UUID,
    "phenomenonId" UUID,
    "score" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAttemptQuestion" (
    "id" UUID NOT NULL,
    "attemptId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "questionTextSnapshot" TEXT NOT NULL,
    "explanationSnapshot" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "points" INTEGER NOT NULL,
    "timeLimitSeconds" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAttemptQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAttemptAnswer" (
    "id" UUID NOT NULL,
    "attemptQuestionId" UUID NOT NULL,
    "selectedOptionId" UUID,
    "selectedOptionText" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "basePoints" INTEGER NOT NULL DEFAULT 0,
    "bonusPoints" INTEGER NOT NULL DEFAULT 0,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "responseTimeMs" INTEGER,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAttemptAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_authUserId_key" ON "User"("authUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_isPublished_sortOrder_idx" ON "Category"("isPublished", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Phenomenon_slug_key" ON "Phenomenon"("slug");

-- CreateIndex
CREATE INDEX "Phenomenon_categoryId_isPublished_sortOrder_idx" ON "Phenomenon"("categoryId", "isPublished", "sortOrder");

-- CreateIndex
CREATE INDEX "LearningMaterial_phenomenonId_type_isPublished_sortOrder_idx" ON "LearningMaterial"("phenomenonId", "type", "isPublished", "sortOrder");

-- CreateIndex
CREATE INDEX "Question_phenomenonId_source_isPublished_isArchived_idx" ON "Question"("phenomenonId", "source", "isPublished", "isArchived");

-- CreateIndex
CREATE INDEX "Question_createdById_source_isArchived_idx" ON "Question"("createdById", "source", "isArchived");

-- CreateIndex
CREATE INDEX "Question_difficulty_idx" ON "Question"("difficulty");

-- CreateIndex
CREATE INDEX "QuestionOption_questionId_sortOrder_idx" ON "QuestionOption"("questionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "QuizSession_code_key" ON "QuizSession"("code");

-- CreateIndex
CREATE INDEX "QuizSession_hostId_createdAt_idx" ON "QuizSession"("hostId", "createdAt");

-- CreateIndex
CREATE INDEX "QuizSession_status_createdAt_idx" ON "QuizSession"("status", "createdAt");

-- CreateIndex
CREATE INDEX "QuizSession_phenomenonId_createdAt_idx" ON "QuizSession"("phenomenonId", "createdAt");

-- CreateIndex
CREATE INDEX "QuizSessionQuestion_questionId_idx" ON "QuizSessionQuestion"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizSessionQuestion_sessionId_position_key" ON "QuizSessionQuestion"("sessionId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "QuizSessionQuestion_sessionId_questionId_key" ON "QuizSessionQuestion"("sessionId", "questionId");

-- CreateIndex
CREATE INDEX "QuizParticipant_sessionId_score_idx" ON "QuizParticipant"("sessionId", "score");

-- CreateIndex
CREATE UNIQUE INDEX "QuizParticipant_sessionId_nickname_key" ON "QuizParticipant"("sessionId", "nickname");

-- CreateIndex
CREATE INDEX "QuizAnswer_sessionQuestionId_pointsEarned_idx" ON "QuizAnswer"("sessionQuestionId", "pointsEarned");

-- CreateIndex
CREATE UNIQUE INDEX "QuizAnswer_participantId_sessionQuestionId_key" ON "QuizAnswer"("participantId", "sessionQuestionId");

-- CreateIndex
CREATE INDEX "QuizAttempt_phenomenonId_createdAt_idx" ON "QuizAttempt"("phenomenonId", "createdAt");

-- CreateIndex
CREATE INDEX "QuizAttempt_status_startedAt_idx" ON "QuizAttempt"("status", "startedAt");

-- CreateIndex
CREATE INDEX "QuizAttemptQuestion_questionId_idx" ON "QuizAttemptQuestion"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizAttemptQuestion_attemptId_position_key" ON "QuizAttemptQuestion"("attemptId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "QuizAttemptQuestion_attemptId_questionId_key" ON "QuizAttemptQuestion"("attemptId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizAttemptAnswer_attemptQuestionId_key" ON "QuizAttemptAnswer"("attemptQuestionId");

-- CreateIndex
CREATE INDEX "QuizAttemptAnswer_selectedOptionId_idx" ON "QuizAttemptAnswer"("selectedOptionId");

-- AddForeignKey
ALTER TABLE "Phenomenon" ADD CONSTRAINT "Phenomenon_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningMaterial" ADD CONSTRAINT "LearningMaterial_phenomenonId_fkey" FOREIGN KEY ("phenomenonId") REFERENCES "Phenomenon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_phenomenonId_fkey" FOREIGN KEY ("phenomenonId") REFERENCES "Phenomenon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSession" ADD CONSTRAINT "QuizSession_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSession" ADD CONSTRAINT "QuizSession_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSession" ADD CONSTRAINT "QuizSession_phenomenonId_fkey" FOREIGN KEY ("phenomenonId") REFERENCES "Phenomenon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSessionQuestion" ADD CONSTRAINT "QuizSessionQuestion_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "QuizSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSessionQuestion" ADD CONSTRAINT "QuizSessionQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizParticipant" ADD CONSTRAINT "QuizParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "QuizSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "QuizParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_sessionQuestionId_fkey" FOREIGN KEY ("sessionQuestionId") REFERENCES "QuizSessionQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "QuestionOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_phenomenonId_fkey" FOREIGN KEY ("phenomenonId") REFERENCES "Phenomenon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttemptQuestion" ADD CONSTRAINT "QuizAttemptQuestion_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "QuizAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttemptQuestion" ADD CONSTRAINT "QuizAttemptQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttemptAnswer" ADD CONSTRAINT "QuizAttemptAnswer_attemptQuestionId_fkey" FOREIGN KEY ("attemptQuestionId") REFERENCES "QuizAttemptQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttemptAnswer" ADD CONSTRAINT "QuizAttemptAnswer_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "QuestionOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;
