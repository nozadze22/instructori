-- CreateTable
CREATE TABLE "InstructorVehicle" (
    "id" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "tag" TEXT,
    "subtag" TEXT,
    "metaLeft" TEXT,
    "metaRight" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstructorVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InstructorVehicle_instructorId_sortOrder_idx" ON "InstructorVehicle"("instructorId", "sortOrder");

-- AddForeignKey
ALTER TABLE "InstructorVehicle" ADD CONSTRAINT "InstructorVehicle_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
