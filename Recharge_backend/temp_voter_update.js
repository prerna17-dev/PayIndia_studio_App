const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateDB() {
    console.log("Connecting to DB...");
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'payindia_studio',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        console.log("Altering voter_corrections...");
        await pool.query(`
            ALTER TABLE voter_corrections
            ADD COLUMN corrected_name VARCHAR(100) NULL AFTER mobile_number,
            ADD COLUMN corrected_dob DATE NULL AFTER corrected_name,
            ADD COLUMN corrected_gender VARCHAR(20) NULL AFTER corrected_dob,
            ADD COLUMN corrected_address TEXT NULL AFTER corrected_gender,
            ADD COLUMN corrected_state VARCHAR(100) NULL AFTER corrected_address,
            ADD COLUMN corrected_pincode VARCHAR(6) NULL AFTER corrected_state,
            ADD COLUMN correction_type VARCHAR(50) NULL AFTER corrected_pincode;
        `);
        console.log("voter_corrections altered successfully.");
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') console.log("Columns already exist in voter_corrections.");
        else console.error(e);
    }

    try {
        console.log("Altering voter_correction_documents ENUM...");
        await pool.query(`
            ALTER TABLE voter_correction_documents
            MODIFY COLUMN document_type VARCHAR(50) NOT NULL;
        `);
        console.log("voter_correction_documents altered successfully.");
    } catch (e) {
        console.error(e);
    }

    process.exit(0);
}
updateDB();
