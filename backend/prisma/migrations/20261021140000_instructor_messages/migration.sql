CREATE TYPE "InstructorMessageStatus" AS ENUM ('UNREAD', 'READ');

CREATE TABLE "InstructorMessage" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "InstructorMessageStatus" NOT NULL DEFAULT 'UNREAD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "InstructorMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InstructorMessage_instructorId_status_createdAt_idx" ON "InstructorMessage"("instructorId", "status", "createdAt");

CREATE INDEX "InstructorMessage_senderId_createdAt_idx" ON "InstructorMessage"("senderId", "createdAt");

ALTER TABLE "InstructorMessage" ADD CONSTRAINT "InstructorMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InstructorMessage" ADD CONSTRAINT "InstructorMessage_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
