-- CreateTable
CREATE TABLE "ChatThreadClear" (
    "id" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clearedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatThreadClear_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatThreadClear_userId_idx" ON "ChatThreadClear"("userId");

-- CreateIndex
CREATE INDEX "ChatThreadClear_instructorId_studentId_idx" ON "ChatThreadClear"("instructorId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatThreadClear_instructorId_studentId_userId_key" ON "ChatThreadClear"("instructorId", "studentId", "userId");

-- AddForeignKey
ALTER TABLE "ChatThreadClear" ADD CONSTRAINT "ChatThreadClear_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
