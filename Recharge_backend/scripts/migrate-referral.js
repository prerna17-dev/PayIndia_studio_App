require('dotenv').config();
const pool = require('../src/config/db');

async function migrate() {
  try {
    console.log('🚀 Starting referral migration...');

    // 1. Add referral_code to users table
    console.log('Adding referral_code to users table...');
    try {
      await pool.query('ALTER TABLE users ADD COLUMN referral_code VARCHAR(15) UNIQUE');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('Column referral_code already exists, skipping.');
      } else {
        throw err;
      }
    }

    // 2. Create referrals table
    console.log('Creating referrals table...');
    const createReferralsQuery = `
      CREATE TABLE IF NOT EXISTS referrals (
        referral_id INT AUTO_INCREMENT PRIMARY KEY,
        referrer_id INT NOT NULL,
        referred_user_id INT NOT NULL,
        status ENUM('PENDING', 'SUCCESS') DEFAULT 'PENDING',
        reward_amount DECIMAL(10, 2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (referrer_id) REFERENCES users(user_id),
        FOREIGN KEY (referred_user_id) REFERENCES users(user_id),
        UNIQUE KEY unique_referral (referred_user_id)
      )
    `;
    await pool.query(createReferralsQuery);

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit();
  }
}

migrate();
