-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('PRIVATE', 'SHARED');

-- CreateEnum
CREATE TYPE "NoteFormat" AS ENUM ('FREEFORM', 'SOAP', 'DAP');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "status" "Status" DEFAULT 'INACTIVE';

-- CreateTable
CREATE TABLE "ClientIntake" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "occupation" TEXT,
    "presentingConcern" TEXT,
    "currentSymptoms" TEXT,
    "medicalHistory" TEXT,
    "mentalHealthHistory" TEXT,
    "medicationHistory" TEXT,
    "familyHistory" TEXT,
    "previousTherapy" TEXT,
    "goals" TEXT,
    "additionalInfo" JSONB,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientIntake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionNote" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "type" "NoteType" NOT NULL DEFAULT 'PRIVATE',
    "format" "NoteFormat" NOT NULL DEFAULT 'FREEFORM',
    "content" TEXT,
    "subjective" TEXT,
    "objective" TEXT,
    "assessment" TEXT,
    "plan" TEXT,
    "data" TEXT,
    "intervention" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientIntake_clientId_key" ON "ClientIntake"("clientId");

-- CreateIndex
CREATE INDEX "SessionNote_appointmentId_idx" ON "SessionNote"("appointmentId");

-- CreateIndex
CREATE INDEX "SessionNote_clientId_idx" ON "SessionNote"("clientId");

-- CreateIndex
CREATE INDEX "SessionNote_therapistId_idx" ON "SessionNote"("therapistId");

-- AddForeignKey
ALTER TABLE "ClientIntake" ADD CONSTRAINT "ClientIntake_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionNote" ADD CONSTRAINT "SessionNote_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionNote" ADD CONSTRAINT "SessionNote_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionNote" ADD CONSTRAINT "SessionNote_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
