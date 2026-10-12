-- MistakeType / MistakeSeverity enums → admin-managed catalog tables

CREATE TABLE "MistakeCategory" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '📝',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MistakeCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MistakeSeverityLevel" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MistakeSeverityLevel_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MistakeCategory_code_key" ON "MistakeCategory"("code");
CREATE INDEX "MistakeCategory_isActive_sortOrder_idx" ON "MistakeCategory"("isActive", "sortOrder");
CREATE UNIQUE INDEX "MistakeSeverityLevel_code_key" ON "MistakeSeverityLevel"("code");
CREATE INDEX "MistakeSeverityLevel_isActive_sortOrder_idx" ON "MistakeSeverityLevel"("isActive", "sortOrder");

INSERT INTO "MistakeCategory" ("id", "code", "label", "icon", "sortOrder", "updatedAt") VALUES
  ('mc-traffic-light', 'TRAFFIC_LIGHT', 'შუქნიშანი', '🚦', 0, CURRENT_TIMESTAMP),
  ('mc-stop-sign', 'STOP_SIGN', 'STOP / გაჩერება', '🛑', 1, CURRENT_TIMESTAMP),
  ('mc-lane-change', 'LANE_CHANGE', 'ზოლის შეცვლა', '↔️', 2, CURRENT_TIMESTAMP),
  ('mc-turn', 'TURN', 'მოხვევა', '↪️', 3, CURRENT_TIMESTAMP),
  ('mc-distance', 'DISTANCE', 'დისტანცია', '🚗', 4, CURRENT_TIMESTAMP),
  ('mc-speeding', 'SPEEDING', 'სიჩქარე', '⚡', 5, CURRENT_TIMESTAMP),
  ('mc-pedestrian', 'PEDESTRIAN', 'ქვეითი', '🚶', 6, CURRENT_TIMESTAMP),
  ('mc-priority', 'PRIORITY', 'პრიორიტეტი', '🔄', 7, CURRENT_TIMESTAMP),
  ('mc-parking', 'PARKING', 'პარკირება', '🅿️', 8, CURRENT_TIMESTAMP),
  ('mc-maneuver', 'MANEUVER', 'მანევრი', '↔️', 9, CURRENT_TIMESTAMP),
  ('mc-prohibited', 'PROHIBITED_ACTION', 'აკრძალული მოქმედება', '❌', 10, CURRENT_TIMESTAMP),
  ('mc-other', 'OTHER', 'სხვა', '📝', 11, CURRENT_TIMESTAMP);

INSERT INTO "MistakeSeverityLevel" ("id", "code", "label", "sortOrder", "updatedAt") VALUES
  ('ms-minor', 'MINOR', 'მცირე', 0, CURRENT_TIMESTAMP),
  ('ms-medium', 'MEDIUM', 'საშუალო', 1, CURRENT_TIMESTAMP),
  ('ms-major', 'MAJOR', 'სერიოზული', 2, CURRENT_TIMESTAMP);

ALTER TABLE "DrivingMistake" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "DrivingMistake" ADD COLUMN "severityId" TEXT;

UPDATE "DrivingMistake" dm
SET "categoryId" = mc."id"
FROM "MistakeCategory" mc
WHERE mc."code" = dm."type"::text;

UPDATE "DrivingMistake" dm
SET "severityId" = ms."id"
FROM "MistakeSeverityLevel" ms
WHERE dm."severity" IS NOT NULL AND ms."code" = dm."severity"::text;

UPDATE "DrivingMistake"
SET "categoryId" = (SELECT "id" FROM "MistakeCategory" WHERE "code" = 'OTHER' LIMIT 1)
WHERE "categoryId" IS NULL;

ALTER TABLE "DrivingMistake" ALTER COLUMN "categoryId" SET NOT NULL;

ALTER TABLE "DrivingMistake" DROP COLUMN "type";
ALTER TABLE "DrivingMistake" DROP COLUMN "severity";

DROP TYPE "MistakeType";
DROP TYPE "MistakeSeverity";

CREATE INDEX "DrivingMistake_categoryId_idx" ON "DrivingMistake"("categoryId");

ALTER TABLE "DrivingMistake" ADD CONSTRAINT "DrivingMistake_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MistakeCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DrivingMistake" ADD CONSTRAINT "DrivingMistake_severityId_fkey" FOREIGN KEY ("severityId") REFERENCES "MistakeSeverityLevel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
