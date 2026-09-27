-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "BookedAppointment" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "month" INTEGER NOT NULL,
    "startTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookedAppointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookedAppointment_therapistId_date_idx" ON "BookedAppointment"("therapistId", "date");

-- AddForeignKey
ALTER TABLE "BookedAppointment" ADD CONSTRAINT "BookedAppointment_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
