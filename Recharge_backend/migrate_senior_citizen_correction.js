require("dotenv").config();
const mysql = require("mysql2/promise");

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'payindia_studio'
    });

    try {
        console.log("--- Creating service_senior_citizen_correction Table ---");
        const sql = `
            CREATE TABLE IF NOT EXISTS service_senior_citizen_correction (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                mobile_number VARCHAR(15) NOT NULL,
                aadhaar_number VARCHAR(12) NOT NULL,
                correction_type VARCHAR(255) NOT NULL,
                corrected_name VARCHAR(255),
                corrected_dob DATE,
                corrected_address TEXT,
                other_details TEXT,
                aadhaar_url VARCHAR(255),
                age_proof_url VARCHAR(255),
                address_proof_url VARCHAR(255),
                photo_url VARCHAR(255),
                reference_id VARCHAR(50) UNIQUE NOT NULL,
                status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        `;
        await connection.query(sql);
        console.log("✅ service_senior_citizen_correction table created successfully.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

migrate();
