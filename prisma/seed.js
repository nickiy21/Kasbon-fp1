require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaLibSql } = require('@prisma/adapter-libsql')
const bcrypt = require('bcryptjs')

const url = process.env.DATABASE_URL || 'file:prisma/dev.db'
const adapter = new PrismaLibSql({ url })
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Seed Users
  const users = [
    { username: 'admin', name: 'Owner Admin', role: 'OWNER' },
    { username: 'spv_doorsmer', name: 'SPV Doorsmer', role: 'LEADER', division: 'DOORSMER' },
    { username: 'spv_marketing', name: 'SPV Marketing', role: 'LEADER', division: 'MARKETING' },
    { username: 'spv_mekanik', name: 'SPV Mekanik', role: 'LEADER', division: 'MEKANIK' },
    { username: 'mekanik', name: 'Mekanik Senior', role: 'EMPLOYEE', division: 'MEKANIK' },
  ]

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { username: u.username },
      update: {
        division: u.division || null
      },
      create: {
        username: u.username,
        name: u.name,
        password: hashedPassword,
        role: u.role,
        division: u.division || null
      },
    })

    // If it's an employee or leader, create a profile
    if (u.role === 'EMPLOYEE' || u.role === 'LEADER') {
      await prisma.employeeProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          basicSalary: 2500000,
          joinDate: new Date('2024-01-01'),
        },
      })
    }
  }

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
