-- Instructor profile messages become accept/reject connection requests.

CREATE TYPE "InstructorMessageStatus_new" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

ALTER TABLE "InstructorMessage" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "InstructorMessage"
  ALTER COLUMN "status" TYPE "InstructorMessageStatus_new"
  USING (
    CASE "status"::text
      WHEN 'UNREAD' THEN 'PENDING'::"InstructorMessageStatus_new"
      WHEN 'READ' THEN 'ACCEPTED'::"InstructorMessageStatus_new"
      ELSE 'PENDING'::"InstructorMessageStatus_new"
    END
  );

DROP TYPE "InstructorMessageStatus";

ALTER TYPE "InstructorMessageStatus_new" RENAME TO "InstructorMessageStatus";

ALTER TABLE "InstructorMessage"
  ALTER COLUMN "status" SET DEFAULT 'PENDING';

ALTER TABLE "InstructorMessage" ADD COLUMN "respondedAt" TIMESTAMP(3);
