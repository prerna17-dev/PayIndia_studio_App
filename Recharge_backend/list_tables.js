const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDB() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'ruturaj',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'recharge_db'
        });

        console.log("Connected to DB:", process.env.DB_NAME);

        const [rows] = await connection.execute('SHOW TABLES');
        console.log("Tables in DB:");
        console.log(rows);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (connection) await connection.end();
    }
}

checkDB();
