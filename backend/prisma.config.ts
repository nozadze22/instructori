import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prefer DIRECT_URL for migrate, fallback to DATABASE_URL for local generate/build.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
