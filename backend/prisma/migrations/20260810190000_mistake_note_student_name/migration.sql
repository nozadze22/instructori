-- DropForeignKey
ALTER TABLE "MistakeNote" DROP CONSTRAINT "MistakeNote_studentId_fkey";

-- DropIndex
DROP INDEX "MistakeNote_studentId_idx";

-- AlterTable
ALTER TABLE "MistakeNote" DROP COLUMN "studentId",
ADD COLUMN "studentName" TEXT NOT NULL;

-- DropTable
DROP TABLE "Student";

-- CreateIndex
CREATE INDEX "MistakeNote_instructorId_studentName_idx" ON "MistakeNote"("instructorId", "studentName");
