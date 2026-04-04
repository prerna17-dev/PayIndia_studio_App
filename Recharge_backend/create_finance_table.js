require('dotenv').config();
const mysql = require('mysql2/promise');

async function createFinanceTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'payindia_db'
    });

    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS user_finances (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                month_name VARCHAR(20) NOT NULL,
                year INT NOT NULL,
                monthly_salary DECIMAL(15, 2) DEFAULT 0.00,
                total_spent DECIMAL(15, 2) DEFAULT 0.00,
                last_month_spent DECIMAL(15, 2) DEFAULT 0.00,
                bill_payments_spent DECIMAL(15, 2) DEFAULT 0.00,
                ott_subscriptions_spent DECIMAL(15, 2) DEFAULT 0.00,
                finance_spent DECIMAL(15, 2) DEFAULT 0.00,
                municipal_taxes_spent DECIMAL(15, 2) DEFAULT 0.00,
                referral_earnings DECIMAL(15, 2) DEFAULT 0.00,
                service_earnings DECIMAL(15, 2) DEFAULT 0.00,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_user_month_year (user_id, month_name, year),
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        await connection.query(createTableQuery);
        console.log('user_finances table created successfully');

    } catch (err) {
        console.error('Error creating table:', err.message);
    } finally {
        await connection.end();
    }
}

createFinanceTable();
