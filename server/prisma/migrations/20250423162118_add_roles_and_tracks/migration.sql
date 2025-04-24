/*
  Warnings:

  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `track` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PRESIDENT', 'TECH_DIRECTOR', 'DIRECTOR', 'E_BOARD', 'PROJECT_MANAGER', 'MEMBER', 'CLIENT');

-- CreateEnum
CREATE TYPE "Track" AS ENUM ('EDUCATION', 'INVESTMENT_FUND', 'CONSULTING', 'TECH_CONSULTING');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
DROP COLUMN "track",
ADD COLUMN     "track" "Track" NOT NULL DEFAULT 'EDUCATION';
