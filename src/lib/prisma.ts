import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import * as mariadb from 'mariadb'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const connectionString = process.env.DATABASE_URL || 'mysql://kasbon-fastprix:Admin1122@148.230.101.38:3034/kasbon-fastprix'

// Parse the connection string since mariadb createPool might not accept the full URI directly as a string or expects specific formats,
// but wait, mariadb's createPool does accept an options object. Let's use the object to be safe.
const dbUrl = new URL(connectionString)
const pool = mariadb.createPool({
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port) || 3306,
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.substring(1),
  connectionLimit: 10
})

const adapter = new PrismaMariaDb(pool as any)

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
