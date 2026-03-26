require('dotenv').config();
const pool = require("./src/config/db");

async function migrate() {
    try {
        console.log("Starting migration: Split parents_aadhaar_url in birth_certificates...");

        // 1. Add new columns
        await pool.query(`
            ALTER TABLE birth_certificates 
            ADD COLUMN father_aadhaar_card_url VARCHAR(255) AFTER hospital_report_url,
            ADD COLUMN mother_aadhaar_card_url VARCHAR(255) AFTER father_aadhaar_card_url
        `);
        console.log("Added father_aadhaar_card_url and mother_aadhaar_card_url columns.");

        // 2. Data migration: Copy existing parents_aadhaar_url to both new columns
        await pool.query(`
            UPDATE birth_certificates 
            SET father_aadhaar_card_url = parents_aadhaar_url, 
                mother_aadhaar_card_url = parents_aadhaar_url 
            WHERE parents_aadhaar_url IS NOT NULL
        `);
        console.log("Migrated data from parents_aadhaar_url to new columns.");

        // 3. Drop old column
        await pool.query(`ALTER TABLE birth_certificates DROP COLUMN parents_aadhaar_url`);
        console.log("Dropped parents_aadhaar_url column.");

        console.log("Migration completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
