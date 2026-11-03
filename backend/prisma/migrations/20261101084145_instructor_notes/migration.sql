/*
  Warnings:

  - You are about to drop the column `country` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `transmissionModes` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "country",
DROP COLUMN "transmissionModes";

-- CreateTable
CREATE TABLE "InstructorNote" (
    "id" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "studentUserId" TEXT,
    "studentName" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "nextSessionAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstructorNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InstructorNote_instructorId_idx" ON "InstructorNote"("instructorId");

-- CreateIndex
CREATE INDEX "InstructorNote_instructorId_nextSessionAt_idx" ON "InstructorNote"("instructorId", "nextSessionAt");

-- CreateIndex
CREATE INDEX "InstructorNote_studentUserId_idx" ON "InstructorNote"("studentUserId");

-- AddForeignKey
ALTER TABLE "InstructorNote" ADD CONSTRAINT "InstructorNote_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstructorNote" ADD CONSTRAINT "InstructorNote_studentUserId_fkey" FOREIGN KEY ("studentUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
