import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is required to initialize Prisma')
}

const dbUrl = new URL(connectionString)
const databaseName = dbUrl.pathname.replace(/^\//, '')
const sanitizedUrl = `${dbUrl.protocol}//${dbUrl.username ? `${decodeURIComponent(dbUrl.username)}:***@` : ''}${dbUrl.hostname}${dbUrl.port ? `:${dbUrl.port}` : ''}${dbUrl.pathname}`

console.log('PRISMA ADAPTER INIT (DIRECT URL)')
console.log('-> Initializing DB URL:', sanitizedUrl)
console.log('-> Parsed Host:', dbUrl.hostname)
console.log('-> Parsed Port:', dbUrl.port || '3306')
console.log('-> Parsed DB:', databaseName)

const adapter = new PrismaMariaDb(connectionString, {
  database: databaseName,
})

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
