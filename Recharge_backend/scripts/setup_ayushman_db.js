require("dotenv").config();
const pool = require("../src/config/db");

const createTableSQL = `
CREATE TABLE IF NOT EXISTS service_ayushman_bharat_correction (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    application_id VARCHAR(50),
    mobile_number VARCHAR(10) NOT NULL,
    aadhaar_number VARCHAR(12) NOT NULL,
    correction_type VARCHAR(100) NOT NULL,
    corrected_name VARCHAR(255),
    corrected_dob DATE,
    corrected_gender VARCHAR(20),
    corrected_address TEXT,
    corrected_ration_card VARCHAR(50),
    aadhaar_url VARCHAR(255),
    ration_card_url VARCHAR(255),
    address_proof_url VARCHAR(255),
    photo_url VARCHAR(255),
    secc_proof_url VARCHAR(255),
    status ENUM('Pending', 'Processing', 'Completed', 'Rejected') DEFAULT 'Pending',
    reference_id VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

(async () => {
    try {
        console.log("Creating Ayushman Bharat correction table...");
        await pool.query(createTableSQL);
        console.log("✅ Table created successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to create table:", err.message);
        process.exit(1);
    }
})();
