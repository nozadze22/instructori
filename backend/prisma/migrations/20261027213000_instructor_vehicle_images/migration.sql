CREATE TABLE "InstructorVehicleImage" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InstructorVehicleImage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InstructorVehicleImage_vehicleId_sortOrder_idx"
ON "InstructorVehicleImage"("vehicleId", "sortOrder");

ALTER TABLE "InstructorVehicleImage"
ADD CONSTRAINT "InstructorVehicleImage_vehicleId_fkey"
FOREIGN KEY ("vehicleId") REFERENCES "InstructorVehicle"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
