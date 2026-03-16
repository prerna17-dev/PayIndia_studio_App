require('dotenv').config({ path: '.env' });
const pool = require('./src/config/db');

const query = `
CREATE TABLE IF NOT EXISTS user_kyc (
  kyc_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  document_type ENUM('AADHAAR', 'PAN') NOT NULL,
  document_number VARCHAR(20) NOT NULL,
  document_image_url VARCHAR(255) NOT NULL,
  status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  admin_remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_doc (user_id, document_type)
);
`;

pool.query(query)
  .then(() => {
    console.log('user_kyc table created successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error creating table:', err);
    process.exit(1);
  });
