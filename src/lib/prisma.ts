import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import * as mariadb from 'mariadb'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const connectionString = process.env.DATABASE_URL || 'mysql://kasbon-fastprix:Admin1122@148.230.101.38:3034/kasbon-fastprix';
const dbUrl = new URL(connectionString);

console.log("PRISMA ADAPTER INIT (DYNAMIC OBJECT V2)");
console.log("-> Initializing DB URL:", connectionString);
console.log("-> Parsed Host:", dbUrl.hostname);
console.log("-> Parsed Port:", dbUrl.port || 3306);
console.log("-> Parsed DB:", dbUrl.pathname.substring(1));

const pool = mariadb.createPool({
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port) || 3306,
  user: dbUrl.username ? decodeURIComponent(dbUrl.username) : undefined,
  password: dbUrl.password ? decodeURIComponent(dbUrl.password) : undefined,
  database: dbUrl.pathname.substring(1),
  connectionLimit: 10,
  connectTimeout: 20000 // Increase timeout to 20s
});

const adapter = new PrismaMariaDb(pool as any)

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
