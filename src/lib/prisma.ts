import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import * as mariadb from 'mariadb'

// Force the database URL into the environment so Prisma's fallback engine logic
// absolutely uses the external IP, bypassing Dokploy's potential ENV configurations.
process.env.DATABASE_URL = 'mysql://kasbon-fastprix:Admin1122@148.230.101.38:3034/kasbon-fastprix';

const globalForPrisma = global as unknown as { prisma: PrismaClient }

console.log("PRISMA ADAPTER INIT (HARDCODED OBJECT)");

const pool = mariadb.createPool({
  host: "148.230.101.38",
  port: 3034,
  user: "kasbon-fastprix",
  password: "Admin1122",
  database: "kasbon-fastprix",
  connectionLimit: 10
});

const adapter = new PrismaMariaDb(pool as any)

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
