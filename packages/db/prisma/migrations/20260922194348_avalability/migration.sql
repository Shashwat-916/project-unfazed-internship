/*
  Warnings:

  - Added the required column `status` to the `Avalability` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AvalabilityStatus" AS ENUM ('LOCKED', 'UNLOCKED');

-- AlterTable
ALTER TABLE "Avalability" ADD COLUMN     "status" "AvalabilityStatus" NOT NULL,
ALTER COLUMN "startTime" SET DEFAULT '9:00:00'::time,
ALTER COLUMN "endTime" SET DEFAULT '16:50:00'::time;

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "duration" SET DEFAULT 50;
