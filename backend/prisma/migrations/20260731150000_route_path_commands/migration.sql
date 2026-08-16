-- CreateEnum
CREATE TYPE "RouteAction" AS ENUM (
  'TURN_LEFT',
  'TURN_RIGHT',
  'STOP',
  'PARKING',
  'REVERSE',
  'U_TURN',
  'CUSTOM'
);

-- AlterTable Route: add path geometry
ALTER TABLE "Route" ADD COLUMN "path" JSONB NOT NULL DEFAULT '[]';

-- Existing text steps are incompatible with geo commands — clear them
DELETE FROM "RouteStep";

-- AlterTable RouteStep: replace text steps with map commands
ALTER TABLE "RouteStep" DROP COLUMN "title";
ALTER TABLE "RouteStep" DROP COLUMN "instruction";
ALTER TABLE "RouteStep" ADD COLUMN "lat" DOUBLE PRECISION NOT NULL;
ALTER TABLE "RouteStep" ADD COLUMN "lng" DOUBLE PRECISION NOT NULL;
ALTER TABLE "RouteStep" ADD COLUMN "action" "RouteAction" NOT NULL;
ALTER TABLE "RouteStep" ADD COLUMN "distanceBeforeVoice" INTEGER NOT NULL DEFAULT 200;
ALTER TABLE "RouteStep" ADD COLUMN "voiceText" TEXT;
