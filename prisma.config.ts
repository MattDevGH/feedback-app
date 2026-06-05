import { defineConfig } from "prisma/config";

// prisma.config.ts controls the Prisma CLI (migrate, generate, studio).
//
// Local development: SQLite via better-sqlite3.
// Production migrations against Neon: run with POSTGRES_PRISMA_URL set.
//   e.g. POSTGRES_PRISMA_URL=<your-neon-url> npx prisma migrate deploy

const isPostgres = !!process.env.POSTGRES_PRISMA_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: isPostgres
    ? { url: process.env.POSTGRES_PRISMA_URL! }
    : { url: "file:./prisma/dev.db" },
});
