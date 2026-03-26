require('dotenv').config();
const pool = require('./src/config/db');

async function executeMigration() {
    try {
        console.log("Creating ration_card_corrections table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS \`ration_card_corrections\` (
                \`id\` INT AUTO_INCREMENT PRIMARY KEY,
                \`user_id\` INT NOT NULL,
                \`ration_card_number\` VARCHAR(50) NOT NULL,
                \`head_aadhaar\` VARCHAR(12) NOT NULL,
                \`update_types\` VARCHAR(255) NOT NULL,
                \`update_details\` JSON,
                \`status\` ENUM('Pending', 'Processing', 'Completed', 'Rejected') DEFAULT 'Pending',
                \`remarks\` TEXT,
                \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Created ration_card_corrections successfully");

        console.log("Creating ration_card_correction_documents table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS \`ration_card_correction_documents\` (
                \`id\` INT AUTO_INCREMENT PRIMARY KEY,
                \`correction_id\` INT NOT NULL,
                \`document_type\` VARCHAR(100) NOT NULL,
                \`file_path\` VARCHAR(255) NOT NULL,
                \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (\`correction_id\`) REFERENCES \`ration_card_corrections\`(\`id\`) ON DELETE CASCADE
            );
        `);
        console.log("Created ration_card_correction_documents successfully");

    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        process.exit();
    }
}

executeMigration();
