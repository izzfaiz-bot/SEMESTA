/*
  Warnings:

  - You are about to drop the column `accentColor` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `background` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `glow` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `iconUrl` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `imageStoragePath` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Category` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "accentColor",
DROP COLUMN "background",
DROP COLUMN "glow",
DROP COLUMN "iconUrl",
DROP COLUMN "imageStoragePath",
DROP COLUMN "imageUrl",
ADD COLUMN     "topics" TEXT[] DEFAULT ARRAY[]::TEXT[];
