require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'payindia_studio'
    });

    try {
        console.log('🚀 Starting Aadhaar Correction Table Migration...');

        // 1. Create aadhar_corrections table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS aadhar_corrections (
                correction_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                aadhar_number VARCHAR(12) NOT NULL,
                mobile_number VARCHAR(15) NOT NULL,
                corrected_name VARCHAR(100),
                corrected_dob DATE,
                correction_type VARCHAR(50),
                status ENUM('Pending', 'Approved', 'Rejected', 'Processed') DEFAULT 'Pending',
                admin_id INT,
                agent_id INT,
                admin_remarks TEXT,
                agent_remarks TEXT,
                processed_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                FOREIGN KEY (admin_id) REFERENCES users(user_id),
                FOREIGN KEY (agent_id) REFERENCES users(user_id)
            )
        `);
        console.log('✅ Table aadhar_corrections created or already exists.');

        // 2. Create aadhar_correction_documents table with expanded document_type ENUM
        await connection.query(`
            CREATE TABLE IF NOT EXISTS aadhar_correction_documents (
                document_id INT AUTO_INCREMENT PRIMARY KEY,
                correction_id INT NOT NULL,
                document_type ENUM('Identity_Proof', 'Identity_Proof_2', 'Address_Proof', 'Address_Proof_2', 'DOB_Proof', 'Photo') NOT NULL,
                file_path VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (correction_id) REFERENCES aadhar_corrections(correction_id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Table aadhar_correction_documents created or already exists.');

        console.log('🎉 Migration completed successfully!');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    } finally {
        await connection.end();
    }
}

migrate();
