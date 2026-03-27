require('dotenv').config();
const mysql = require("mysql2/promise");

(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || undefined,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  });

  try {
    const [rows] = await pool.query('DESCRIBE death_certificates');
    console.log(JSON.stringify(rows.map(r => r.Field), null, 2));
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    process.exit();
  }
})();
