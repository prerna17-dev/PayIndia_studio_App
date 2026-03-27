require('dotenv').config();
const pool = require("./src/config/db");

async function migrate() {
    try {
        console.log("Starting migration...");
        const columns = [
            "ALTER TABLE caste_certificates ADD COLUMN state VARCHAR(255) AFTER district;",
            "ALTER TABLE caste_certificates ADD COLUMN pincode VARCHAR(6) AFTER state;",
            "ALTER TABLE caste_certificates ADD COLUMN father_aadhaar VARCHAR(12) AFTER pincode;",
            "ALTER TABLE caste_certificates ADD COLUMN father_occupation VARCHAR(255) AFTER father_aadhaar;",
            "ALTER TABLE caste_certificates ADD COLUMN existing_certificate_no VARCHAR(100) AFTER father_occupation;",
            "ALTER TABLE caste_certificates ADD COLUMN previously_issued ENUM('Yes', 'No') AFTER existing_certificate_no;",
            "ALTER TABLE caste_certificates ADD COLUMN duration_of_residence VARCHAR(100) AFTER previously_issued;"
        ];

        for (const sql of columns) {
            try {
                await pool.query(sql);
                console.log(`Executed: ${sql}`);
            } catch (e) {
                if (e.message.includes("Duplicate column name")) {
                    console.log(`Column already exists for: ${sql}`);
                } else {
                    throw e;
                }
            }
        }
        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err.message);
        process.exit(1);
    }
}

migrate();
