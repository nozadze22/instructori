-- CreateEnum
CREATE TYPE "MistakeType" AS ENUM ('TRAFFIC_LIGHT', 'STOP_SIGN', 'LANE_CHANGE', 'TURN', 'DISTANCE', 'SPEEDING', 'PEDESTRIAN', 'PRIORITY', 'PARKING', 'MANEUVER', 'PROHIBITED_ACTION', 'OTHER');

-- CreateEnum
CREATE TYPE "MistakeSeverity" AS ENUM ('MINOR', 'MEDIUM', 'MAJOR');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'INSTRUCTOR';

-- CreateTable
CREATE TABLE "DrivingSession" (
    "id" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "studentUserId" TEXT,
    "routeId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrivingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrivingMistake" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" "MistakeType" NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "severity" "MistakeSeverity",
    "note" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DrivingMistake_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DrivingSession_instructorId_idx" ON "DrivingSession"("instructorId");

-- CreateIndex
CREATE INDEX "DrivingSession_studentUserId_idx" ON "DrivingSession"("studentUserId");

-- CreateIndex
CREATE INDEX "DrivingSession_studentName_idx" ON "DrivingSession"("studentName");

-- CreateIndex
CREATE INDEX "DrivingSession_routeId_idx" ON "DrivingSession"("routeId");

-- CreateIndex
CREATE INDEX "DrivingMistake_sessionId_idx" ON "DrivingMistake"("sessionId");

-- CreateIndex
CREATE INDEX "DrivingMistake_sessionId_timestamp_idx" ON "DrivingMistake"("sessionId", "timestamp");

-- AddForeignKey
ALTER TABLE "DrivingSession" ADD CONSTRAINT "DrivingSession_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrivingSession" ADD CONSTRAINT "DrivingSession_studentUserId_fkey" FOREIGN KEY ("studentUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrivingSession" ADD CONSTRAINT "DrivingSession_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrivingMistake" ADD CONSTRAINT "DrivingMistake_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "DrivingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
