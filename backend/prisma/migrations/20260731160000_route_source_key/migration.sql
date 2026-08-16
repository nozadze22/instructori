-- AlterTable
ALTER TABLE "Route" ADD COLUMN "sourceKey" TEXT;
ALTER TABLE "Route" ADD COLUMN "sourceUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Route_sourceKey_key" ON "Route"("sourceKey");

-- CreateIndex
CREATE INDEX "Route_city_idx" ON "Route"("city");
