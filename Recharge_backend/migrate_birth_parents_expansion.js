require('dotenv').config();
const pool = require("./src/config/db");

async function migrate() {
    try {
        console.log('Starting migration: Expanding parents details in birth_certificates...');
        
        const alterQuery = `
            ALTER TABLE birth_certificates 
            ADD COLUMN IF NOT EXISTS father_dob DATE DEFAULT NULL AFTER father_occupation,
            ADD COLUMN IF NOT EXISTS father_marital_status VARCHAR(50) DEFAULT NULL AFTER father_dob,
            ADD COLUMN IF NOT EXISTS father_place_of_birth VARCHAR(255) DEFAULT NULL AFTER father_marital_status,
            ADD COLUMN IF NOT EXISTS father_address TEXT DEFAULT NULL AFTER father_place_of_birth,
            ADD COLUMN IF NOT EXISTS mother_dob DATE DEFAULT NULL AFTER mother_occupation,
            ADD COLUMN IF NOT EXISTS mother_marital_status VARCHAR(50) DEFAULT NULL AFTER mother_dob,
            ADD COLUMN IF NOT EXISTS mother_place_of_birth VARCHAR(255) DEFAULT NULL AFTER mother_marital_status,
            ADD COLUMN IF NOT EXISTS mother_address TEXT DEFAULT NULL AFTER mother_place_of_birth
        `;

        await pool.query(alterQuery);
        console.log('Migration successful: Added father and mother detailed fields.');
        
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
