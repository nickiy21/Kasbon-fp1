import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- DATABASE DIAGNOSTIC ---')
  try {
    const users = await prisma.user.findMany()
    console.log('Users found:', users.length)
    users.forEach(u => {
      console.log(`- ${u.username} (${u.role})`)
    })
  } catch (error) {
    console.error('Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
