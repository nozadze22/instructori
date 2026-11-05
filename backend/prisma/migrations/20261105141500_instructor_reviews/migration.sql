-- CreateTable
CREATE TABLE "InstructorReview" (
    "id" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstructorReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InstructorReview_instructorId_createdAt_idx" ON "InstructorReview"("instructorId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "InstructorReview_instructorId_studentId_key" ON "InstructorReview"("instructorId", "studentId");

-- AddForeignKey
ALTER TABLE "InstructorReview" ADD CONSTRAINT "InstructorReview_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstructorReview" ADD CONSTRAINT "InstructorReview_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
