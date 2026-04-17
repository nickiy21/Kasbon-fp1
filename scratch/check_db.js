const mysql = require('mysql2/promise');
async function check() {
  const pool = mysql.createPool('mysql://kasbon-fastprix:Admin1122@148.230.101.38:3034/kasbon-fastprix');
  const [rows] = await pool.query('SELECT username, role, name FROM User');
  console.log('USERS IN DB:', rows);
  await pool.end();
}
check();
