require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

async function checkColumns() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'payindia_db'
    });

    try {
        const [cols712] = await connection.query('SHOW COLUMNS FROM service_712_extract');
        const [cols8a] = await connection.query('SHOW COLUMNS FROM service_8a_extract');
        const [colsFerfar] = await connection.query('SHOW COLUMNS FROM service_ferfar_application');
        
        const schema = {
            '712': cols712.map(c => c.Field),
            '8A': cols8a.map(c => c.Field),
            'Ferfar': colsFerfar.map(c => c.Field)
        };
        
        fs.writeFileSync('db_schema.json', JSON.stringify(schema, null, 2));
        console.log('Schema saved to db_schema.json');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await connection.end();
    }
}

checkColumns();
