require('dotenv').config();
const mysql = require('mysql2/promise');

async function repair() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'payindia_db'
    });

    try {
        console.log('Adding missing columns...');
        
        // 8A
        await connection.query('ALTER TABLE service_8a_extract ADD COLUMN IF NOT EXISTS property_details_url VARCHAR(255) AFTER photo_url');
        
        // Ferfar
        await connection.query('ALTER TABLE service_ferfar_application ADD COLUMN IF NOT EXISTS application_form_url VARCHAR(255) AFTER ownership_doc_url');
        
        console.log('Database repair completed successfully.');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await connection.end();
    }
}

repair();
