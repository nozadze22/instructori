-- AlterTable
ALTER TABLE "User" ADD COLUMN "instructorCode" TEXT,
ADD COLUMN "linkedInstructorId" TEXT;

-- Backfill instructor codes for existing instructors
UPDATE "User"
SET "instructorCode" = UPPER(SUBSTRING(REPLACE("id"::text, '-', ''), 1, 8))
WHERE "role" = 'INSTRUCTOR' AND "instructorCode" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_instructorCode_key" ON "User"("instructorCode");

-- CreateIndex
CREATE INDEX "User_linkedInstructorId_idx" ON "User"("linkedInstructorId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_linkedInstructorId_fkey" FOREIGN KEY ("linkedInstructorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
