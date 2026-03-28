require('dotenv').config();
const mysql = require('mysql2/promise');

async function createTables() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'payindia_db'
    });

    try {
        console.log('Creating correction tables...');
        
        // service_712_correction
        await connection.query(`
            CREATE TABLE IF NOT EXISTS service_712_correction (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                satbara_id VARCHAR(50),
                aadhaar_number VARCHAR(12),
                mobile_number VARCHAR(10),
                correction_type VARCHAR(255),
                corrected_name VARCHAR(255),
                corrected_area VARCHAR(100),
                corrected_occupant VARCHAR(255),
                corrected_land_use VARCHAR(255),
                other_details TEXT,
                id_proof_url VARCHAR(255),
                supporting_doc_url VARCHAR(255),
                reference_id VARCHAR(50) UNIQUE,
                status ENUM('PENDING', 'PROCESSED', 'REJECTED') DEFAULT 'PENDING',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        `);
        console.log('Table service_712_correction created.');

        // service_ferfar_correction
        await connection.query(`
            CREATE TABLE IF NOT EXISTS service_ferfar_correction (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                ferfar_number VARCHAR(50),
                aadhaar_number VARCHAR(12),
                mobile_number VARCHAR(10),
                correction_type VARCHAR(255),
                corrected_applicant_name VARCHAR(255),
                corrected_mutation_year VARCHAR(4),
                corrected_mutation_reason TEXT,
                other_details TEXT,
                id_proof_url VARCHAR(255),
                supporting_doc_url VARCHAR(255),
                reference_id VARCHAR(50) UNIQUE,
                status ENUM('PENDING', 'PROCESSED', 'REJECTED') DEFAULT 'PENDING',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        `);
        console.log('Table service_ferfar_correction created.');

        console.log('All correction tables created successfully.');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await connection.end();
    }
}

createTables();
