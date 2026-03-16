const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function runSchema() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'ruturaj',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'payindia_studio',
            multipleStatements: true
        });

        console.log("Connected to DB");

        const schema = fs.readFileSync('e:/WorknAI/PayIndiastudio_App/Recharge_backend/src/database/ration_card_schema.sql', 'utf8');
        
        await connection.query(schema);
        console.log("Schema executed successfully");

    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (connection) await connection.end();
    }
}

runSchema();
