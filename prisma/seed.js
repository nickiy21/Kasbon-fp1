require('dotenv').config()
const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')

async function main() {
  console.log('Using URL for seeding...');
  const pool = mysql.createPool('mysql://kasbon-fastprix:Admin1122@148.230.101.38:3034/kasbon-fastprix')
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  console.log('Seeding via RAW SQL...');
  
  // Seed Users manually
  const users = [
    ['admin', 'Owner Admin', 'OWNER', null],
    ['spv_doorsmer', 'SPV Doorsmer', 'LEADER', 'DOORSMER'],
    ['spv_marketing', 'SPV Marketing', 'LEADER', 'MARKETING'],
    ['spv_mekanik', 'SPV Mekanik', 'LEADER', 'MEKANIK'],
    ['mekanik', 'Mekanik Senior', 'EMPLOYEE', 'MEKANIK'],
  ]

  for (const [username, name, role, division] of users) {
     const id = Math.random().toString(36).substring(7);
     await pool.execute(
       'INSERT INTO User (id, username, name, password, role, division) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE division=VALUES(division)',
       [id, username, name, hashedPassword, role, division]
     ).catch(err => {
       if (err.code !== 'ER_DUP_ENTRY') throw err;
     })
  }

  console.log('Seeding complete!');
  await pool.end();
}

main().catch(console.error);
