-- Generalize chat pairs from instructor/student to ordered userLow/userHigh

-- ChatMessage
ALTER TABLE "ChatMessage" ADD COLUMN "userLowId" TEXT;
ALTER TABLE "ChatMessage" ADD COLUMN "userHighId" TEXT;

UPDATE "ChatMessage"
SET
  "userLowId" = CASE
    WHEN "instructorId" < "studentId" THEN "instructorId"
    ELSE "studentId"
  END,
  "userHighId" = CASE
    WHEN "instructorId" < "studentId" THEN "studentId"
    ELSE "instructorId"
  END;

ALTER TABLE "ChatMessage" ALTER COLUMN "userLowId" SET NOT NULL;
ALTER TABLE "ChatMessage" ALTER COLUMN "userHighId" SET NOT NULL;

ALTER TABLE "ChatMessage" DROP CONSTRAINT IF EXISTS "ChatMessage_instructorId_fkey";
ALTER TABLE "ChatMessage" DROP CONSTRAINT IF EXISTS "ChatMessage_studentId_fkey";

DROP INDEX IF EXISTS "ChatMessage_instructorId_studentId_createdAt_idx";
DROP INDEX IF EXISTS "ChatMessage_studentId_createdAt_idx";

ALTER TABLE "ChatMessage" DROP COLUMN "instructorId";
ALTER TABLE "ChatMessage" DROP COLUMN "studentId";

CREATE INDEX "ChatMessage_userLowId_userHighId_createdAt_idx"
  ON "ChatMessage"("userLowId", "userHighId", "createdAt");

ALTER TABLE "ChatMessage"
  ADD CONSTRAINT "ChatMessage_userLowId_fkey"
  FOREIGN KEY ("userLowId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChatMessage"
  ADD CONSTRAINT "ChatMessage_userHighId_fkey"
  FOREIGN KEY ("userHighId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ChatThreadClear
ALTER TABLE "ChatThreadClear" ADD COLUMN "userLowId" TEXT;
ALTER TABLE "ChatThreadClear" ADD COLUMN "userHighId" TEXT;

UPDATE "ChatThreadClear"
SET
  "userLowId" = CASE
    WHEN "instructorId" < "studentId" THEN "instructorId"
    ELSE "studentId"
  END,
  "userHighId" = CASE
    WHEN "instructorId" < "studentId" THEN "studentId"
    ELSE "instructorId"
  END;

ALTER TABLE "ChatThreadClear" ALTER COLUMN "userLowId" SET NOT NULL;
ALTER TABLE "ChatThreadClear" ALTER COLUMN "userHighId" SET NOT NULL;

ALTER TABLE "ChatThreadClear" DROP CONSTRAINT IF EXISTS "ChatThreadClear_instructorId_studentId_userId_key";

DROP INDEX IF EXISTS "ChatThreadClear_instructorId_studentId_idx";

ALTER TABLE "ChatThreadClear" DROP COLUMN "instructorId";
ALTER TABLE "ChatThreadClear" DROP COLUMN "studentId";

CREATE UNIQUE INDEX "ChatThreadClear_userLowId_userHighId_userId_key"
  ON "ChatThreadClear"("userLowId", "userHighId", "userId");

CREATE INDEX "ChatThreadClear_userLowId_userHighId_idx"
  ON "ChatThreadClear"("userLowId", "userHighId");
