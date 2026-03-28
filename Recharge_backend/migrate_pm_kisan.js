require("dotenv").config();
const pool = require("./src/config/db");

async function migrate() {
    try {
        console.log("--- Creating service_pm_kisan_correction Table ---");
        const sql = `
            CREATE TABLE IF NOT EXISTS service_pm_kisan_correction (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                mobile_number VARCHAR(15) NOT NULL,
                selected_fields TEXT,
                aadhaar_url VARCHAR(255),
                bank_url VARCHAR(255),
                land_url VARCHAR(255),
                mobile_url VARCHAR(255),
                reference_id VARCHAR(50) UNIQUE NOT NULL,
                status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        `;
        await pool.query(sql);
        console.log("✅ service_pm_kisan_correction table created successfully.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
}

migrate();
