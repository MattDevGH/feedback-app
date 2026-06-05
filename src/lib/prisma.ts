import { PrismaClient } from "@/generated/prisma";

// In production (Vercel + Neon), use the Neon serverless adapter.
// In development, use the local SQLite adapter.
//
// POSTGRES_PRISMA_URL is injected automatically by the Vercel Neon integration.
// DATABASE_URL in .env.local will override for local Postgres if ever needed.

function createPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === "production" || process.env.POSTGRES_PRISMA_URL) {
    const { PrismaNeon } = require("@prisma/adapter-neon");
    const { neonConfig, Pool } = require("@neondatabase/serverless");

    // Use WebSockets for Neon's serverless connection pooler
    const { WebSocket } = require("ws");
    neonConfig.webSocketConstructor = WebSocket;

    const connectionString = process.env.POSTGRES_PRISMA_URL;
    if (!connectionString) {
      throw new Error("POSTGRES_PRISMA_URL environment variable is not set.");
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({ adapter });
  }

  // Local development — SQLite via better-sqlite3
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  const path = require("path");
  const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  return new PrismaClient({ adapter });
}

// Prevent multiple instances in development (hot reload)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
