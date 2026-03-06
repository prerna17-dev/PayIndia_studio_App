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
            'SELECT * FROM ration_card_applications ORDER BY id DESC LIMIT 5'
        );

        console.log("Last 5 Ration Card records:");
        console.log(JSON.stringify(rows, null, 2));

        for (const row of rows) {
            const [docs] = await connection.execute(
                'SELECT * FROM ration_card_documents WHERE application_id = ?',
                [row.id]
            );
            console.log(`Documents for Ration Card ID ${row.id}:`);
            console.log(JSON.stringify(docs, null, 2));
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (connection) await connection.end();
    }
}

checkDB();
