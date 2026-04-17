import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import * as mariadb from 'mariadb'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// We forcefully use the external IP in case Dokploy internal DNS (kasbonfastprix1-...) fails 
// and falls back to 127.0.0.1
const mariadbString = 'mariadb://kasbon-fastprix:Admin1122@148.230.101.38:3034/kasbon-fastprix';

console.log("PRISMA ADAPTER INIT:");
console.log("-> mariadbString:", mariadbString);

const pool = mariadb.createPool(mariadbString);

const adapter = new PrismaMariaDb(pool as any)

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
