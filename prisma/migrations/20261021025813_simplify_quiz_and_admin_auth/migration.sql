/*
  Warnings:

  - You are about to drop the column `authUserId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `QuizAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuizParticipant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuizSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuizSessionQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuizSetting` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "QuizAnswer" DROP CONSTRAINT "QuizAnswer_participantId_fkey";

-- DropForeignKey
ALTER TABLE "QuizAnswer" DROP CONSTRAINT "QuizAnswer_selectedOptionId_fkey";

-- DropForeignKey
ALTER TABLE "QuizAnswer" DROP CONSTRAINT "QuizAnswer_sessionQuestionId_fkey";

-- DropForeignKey
ALTER TABLE "QuizParticipant" DROP CONSTRAINT "QuizParticipant_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSession" DROP CONSTRAINT "QuizSession_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSession" DROP CONSTRAINT "QuizSession_hostId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSession" DROP CONSTRAINT "QuizSession_phenomenonId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSessionQuestion" DROP CONSTRAINT "QuizSessionQuestion_questionId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSessionQuestion" DROP CONSTRAINT "QuizSessionQuestion_sessionId_fkey";

-- DropIndex
DROP INDEX "User_authUserId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "authUserId",
DROP COLUMN "name",
ADD COLUMN     "passwordHash" TEXT;

-- DropTable
DROP TABLE "QuizAnswer";

-- DropTable
DROP TABLE "QuizParticipant";

-- DropTable
DROP TABLE "QuizSession";

-- DropTable
DROP TABLE "QuizSessionQuestion";

-- DropTable
DROP TABLE "QuizSetting";

-- DropEnum
DROP TYPE "SessionStatus";

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" VARCHAR(64) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminSession_userId_expiresAt_idx" ON "AdminSession"("userId", "expiresAt");

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
