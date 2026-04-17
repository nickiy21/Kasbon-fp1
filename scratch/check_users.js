const { PrismaClient } = require('@prisma/client')
const { PrismaLibSql } = require('@prisma/adapter-libsql')
const path = require('path')

const dbPath = path.resolve(__dirname, '../dev.db');
const url = `file:${dbPath}`;

const adapter = new PrismaLibSql({ url })
const prisma = new PrismaClient({ adapter })

async function check() {
  try {
    const requests = await prisma.kasbonRequest.findMany({
      select: { id: true, purpose: true, amount: true, division: true, status: true, employeeName: true },
      orderBy: { submissionDate: 'desc' },
      take: 10
    })
    console.log('RECENT REQUESTS:')
    console.log(JSON.stringify(requests, null, 2))

    const users = await prisma.user.findMany({
      where: { role: 'LEADER' },
      select: { username: true, division: true }
    })
    console.log('\nLEADERS:')
    console.log(JSON.stringify(users, null, 2))

  } catch (err) {
    console.error('Check failed:', err);
  } finally {
    await prisma.$disconnect()
  }
}
check()
