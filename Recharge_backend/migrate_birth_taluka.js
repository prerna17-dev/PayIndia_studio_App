require('dotenv').config();
const pool = require("./src/config/db");

async function migrate() {
    try {
        console.log("Adding taluka to birth_certificates...");
        await pool.query("ALTER TABLE birth_certificates ADD COLUMN IF NOT EXISTS taluka VARCHAR(255) AFTER village");
        console.log("Migration successful!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit();
    }
}

migrate();
