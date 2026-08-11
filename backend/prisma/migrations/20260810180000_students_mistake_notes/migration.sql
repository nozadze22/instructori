-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MistakeNote" (
    "id" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "mistakes" JSONB NOT NULL DEFAULT '[]',
    "practicedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MistakeNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Student_instructorId_idx" ON "Student"("instructorId");

-- CreateIndex
CREATE INDEX "MistakeNote_instructorId_idx" ON "MistakeNote"("instructorId");

-- CreateIndex
CREATE INDEX "MistakeNote_studentId_idx" ON "MistakeNote"("studentId");

-- CreateIndex
CREATE INDEX "MistakeNote_routeId_idx" ON "MistakeNote"("routeId");

-- CreateIndex
CREATE INDEX "MistakeNote_city_idx" ON "MistakeNote"("city");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MistakeNote" ADD CONSTRAINT "MistakeNote_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MistakeNote" ADD CONSTRAINT "MistakeNote_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MistakeNote" ADD CONSTRAINT "MistakeNote_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
