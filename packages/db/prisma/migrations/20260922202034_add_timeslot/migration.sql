/*
  Warnings:

  - You are about to drop the column `endTime` on the `Avalability` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Avalability` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Avalability` table. All the data in the column will be lost.
  - Added the required column `timeSlotId` to the `Avalability` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Avalability" DROP COLUMN "endTime",
DROP COLUMN "startTime",
DROP COLUMN "status",
ADD COLUMN     "timeSlotId" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "AvalabilityStatus";

-- CreateTable
CREATE TABLE "TimeSlot" (
    "id" INTEGER NOT NULL,
    "startTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,

    CONSTRAINT "TimeSlot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Avalability" ADD CONSTRAINT "Avalability_timeSlotId_fkey" FOREIGN KEY ("timeSlotId") REFERENCES "TimeSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
