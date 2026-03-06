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

        console.log("Connected to DB");

        const [rows] = await connection.execute(
            'SELECT * FROM income_certificates WHERE id = 16 OR 1=1 ORDER BY id DESC LIMIT 5'
        );

        console.log("Last 5 Income Certificate records:");
        console.log(JSON.stringify(rows, null, 2));

    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (connection) await connection.end();
    }
}

checkDB();
