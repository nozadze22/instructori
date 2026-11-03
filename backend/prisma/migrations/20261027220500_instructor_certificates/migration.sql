CREATE TABLE "InstructorCertificate" (
    "id" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "InstructorCertificate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InstructorCertificate_instructorId_sortOrder_idx"
ON "InstructorCertificate"("instructorId", "sortOrder");

ALTER TABLE "InstructorCertificate"
ADD CONSTRAINT "InstructorCertificate_instructorId_fkey"
FOREIGN KEY ("instructorId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
