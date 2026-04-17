const mysql = require('mysql2/promise');
async function test() {
  try {
    const pool = mysql.createPool('mysql://kasbon-fastprix:Admin1122@148.230.101.38:3034/kasbon-fastprix');
    const [rows] = await pool.query('SELECT 1 as val');
    console.log('SUCCESS:', rows);
    await pool.end();
  } catch (e) {
    console.error('FAILED:', e);
  }
}
test();
