-- Profile.country existed in schema; some DBs were created before this column.
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "country" TEXT;
