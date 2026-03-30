require("dotenv").config();
const pool = require("../src/config/db");

const createTableSQL = `
CREATE TABLE IF NOT EXISTS service_employment_registration_correction (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    registration_id VARCHAR(50) NOT NULL,
    mobile_number VARCHAR(10) NOT NULL,
    aadhaar_number VARCHAR(12) NOT NULL,
    correction_type VARCHAR(100) NOT NULL,
    corrected_name VARCHAR(255),
    corrected_dob DATE,
    corrected_address TEXT,
    corrected_qualification TEXT,
    corrected_experience TEXT,
    corrected_skills TEXT,
    other_details TEXT,
    aadhaar_url VARCHAR(255),
    education_cert_url VARCHAR(255),
    experience_cert_url VARCHAR(255),
    photo_url VARCHAR(255),
    supporting_doc_url VARCHAR(255),
    status ENUM('Pending', 'Processing', 'Completed', 'Rejected') DEFAULT 'Pending',
    reference_id VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

(async () => {
    try {
        console.log("Creating employment correction table...");
        await pool.query(createTableSQL);
        console.log("✅ Table created successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to create table:", err.message);
        process.exit(1);
    }
})();
