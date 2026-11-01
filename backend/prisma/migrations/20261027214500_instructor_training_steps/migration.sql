CREATE TABLE "InstructorTrainingStep" (
    "id" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "InstructorTrainingStep_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InstructorTrainingStep_instructorId_sortOrder_idx"
ON "InstructorTrainingStep"("instructorId", "sortOrder");

ALTER TABLE "InstructorTrainingStep"
ADD CONSTRAINT "InstructorTrainingStep_instructorId_fkey"
FOREIGN KEY ("instructorId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
