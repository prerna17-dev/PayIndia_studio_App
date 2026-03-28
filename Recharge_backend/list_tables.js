require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

async function listTables() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'payindia_db'
    });

    try {
        const [tables] = await connection.query('SHOW TABLES');
        const list = tables.map(t => Object.values(t)[0]);
        fs.writeFileSync('tables.json', JSON.stringify(list, null, 2));
        console.log('Tables saved to tables.json');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await connection.end();
    }
}

listTables();
