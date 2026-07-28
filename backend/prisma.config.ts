import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Neon direct (non-pooled) URL — required for Prisma Migrate
    url: env("DIRECT_URL"),
  },
});
