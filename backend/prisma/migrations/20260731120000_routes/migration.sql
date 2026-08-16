-- CreateEnum
CREATE TYPE "RouteVisibility" AS ENUM ('SYSTEM', 'PRIVATE');

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "city" TEXT,
    "visibility" "RouteVisibility" NOT NULL DEFAULT 'PRIVATE',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteStep" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT,
    "instruction" TEXT NOT NULL,
    "audioUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RouteStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Route_createdById_idx" ON "Route"("createdById");

-- CreateIndex
CREATE INDEX "Route_visibility_isPublished_idx" ON "Route"("visibility", "isPublished");

-- CreateIndex
CREATE INDEX "RouteStep_routeId_order_idx" ON "RouteStep"("routeId", "order");

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStep" ADD CONSTRAINT "RouteStep_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;
