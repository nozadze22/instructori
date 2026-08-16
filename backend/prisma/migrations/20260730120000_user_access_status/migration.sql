-- CreateEnum
CREATE TYPE "AccessStatus" AS ENUM ('PENDING', 'ACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "AccessSource" AS ENUM ('ADMIN', 'PAYMENT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "accessStatus" "AccessStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "User" ADD COLUMN "accessSource" "AccessSource";
ALTER TABLE "User" ADD COLUMN "accessGrantedAt" TIMESTAMP(3);

-- Existing admins get full access
UPDATE "User"
SET "accessStatus" = 'ACTIVE',
    "accessSource" = 'ADMIN',
    "accessGrantedAt" = NOW()
WHERE "role" = 'ADMIN';
