require('dotenv').config();
const pool = require("./src/config/db");

async function migrate() {
    try {
        console.log("Starting migration for birth_certificates...");
        
        // Add applicant_mobile if not exists
        await pool.query("ALTER TABLE birth_certificates ADD COLUMN IF NOT EXISTS applicant_mobile VARCHAR(10) AFTER user_id");
        
        // Add applicant_aadhaar if not exists
        await pool.query("ALTER TABLE birth_certificates ADD COLUMN IF NOT EXISTS applicant_aadhaar VARCHAR(12) AFTER applicant_mobile");
        
        // Add email if not exists
        await pool.query("ALTER TABLE birth_certificates ADD COLUMN IF NOT EXISTS email VARCHAR(255) AFTER applicant_aadhaar");
        
        console.log("Migration successful!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit();
    }
}

migrate();
