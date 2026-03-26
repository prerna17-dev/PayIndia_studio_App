
﻿  create database payindia_studio;

create database payindia_studio;

use payindia_studio;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  mobile_number VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(100),
  gender ENUM('Male','Female','Other'),

  user_email VARCHAR(100),

  user_email VARCHAR(12) UNIQUE,

  date_of_birth DATE,
  profile_image VARCHAR(255),
  wallet_balance DECIMAL(10,2) DEFAULT 0.00,
  role ENUM('USER','ADMIN','AGENT') NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_mobile (mobile_number)
);


CREATE TABLE login_sessions (
  session_id INT AUTO_INCREMENT PRIMARY KEY,
  mobile_number VARCHAR(15) NOT NULL,
  otp VARCHAR(6),
  otp_generated_at TIMESTAMP,
  otp_expires_at TIMESTAMP,
  is_verified BOOLEAN DEFAULT FALSE,
  session_token VARCHAR(255),
  ip_address VARCHAR(45),
  device_info TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_mobile_session (mobile_number),
  INDEX idx_token (session_token)
);


CREATE TABLE transactions (
  transaction_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  transaction_type ENUM('Recharge','Loan','Insurance','Wallet_Credit','Wallet_Debit') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  status ENUM('Pending','Success','Failed') DEFAULT 'Pending',
  transaction_reference VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user_transactions (user_id),
  INDEX idx_transaction_ref (transaction_reference)
);


CREATE TABLE recharges (
  recharge_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  transaction_id INT,
  operator VARCHAR(50),
  circle VARCHAR(50),
  recharge_number VARCHAR(15),
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('Pending','Success','Failed') DEFAULT 'Pending',
  api_response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id),
  INDEX idx_user_recharges (user_id)
);


CREATE TABLE banks (
  bank_id INT AUTO_INCREMENT PRIMARY KEY,
  bank_name VARCHAR(100) NOT NULL,
  bank_code VARCHAR(20) UNIQUE NOT NULL,
  ifsc_prefix VARCHAR(10),
  logo_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  supports_upi BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_bank_code (bank_code)
);

CREATE TABLE user_bank_accounts (
  account_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  bank_id INT NOT NULL,
  account_number VARCHAR(20) NOT NULL,
  account_holder_name VARCHAR(100) NOT NULL,
  ifsc_code VARCHAR(11) NOT NULL,
  account_type ENUM('Savings','Current') DEFAULT 'Savings',
  linked_mobile VARCHAR(15),
  is_verified BOOLEAN DEFAULT FALSE,
  is_primary BOOLEAN DEFAULT FALSE,
  verification_status ENUM('Pending','Verified','Failed') DEFAULT 'Pending',
  verification_date TIMESTAMP NULL,
  balance DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (bank_id) REFERENCES banks(bank_id),
  UNIQUE KEY unique_account (user_id, account_number),
  INDEX idx_user_accounts (user_id),
  INDEX idx_account_number (account_number)
);

CREATE TABLE bank_verification_otps (
  verification_id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT NOT NULL,
  mobile_number VARCHAR(15) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  otp_generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  otp_expires_at TIMESTAMP,
  is_verified BOOLEAN DEFAULT FALSE,
  attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES user_bank_accounts(account_id) ON DELETE CASCADE,
  INDEX idx_account_verification (account_id)
);

CREATE TABLE payment_methods (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id INT NOT NULL,
  payment_type ENUM('Wallet','Bank_Account','UPI','Card') NOT NULL,
  bank_account_id INT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_reference VARCHAR(100),
  payment_status ENUM('Pending','Success','Failed') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE,
  FOREIGN KEY (bank_account_id) REFERENCES user_bank_accounts(account_id),
  INDEX idx_transaction_payment (transaction_id)
);


CREATE TABLE operators (
  operator_id INT AUTO_INCREMENT PRIMARY KEY,
  operator_code VARCHAR(20) UNIQUE,
  operator_name VARCHAR(100),
  service_type ENUM('MOBILE','DTH','ELECTRICITY'),
  is_active BOOLEAN DEFAULT TRUE
);


CREATE TABLE bill_payments (
  bill_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  transaction_id INT NOT NULL,
  operator_id INT NOT NULL,
  consumer_number VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  latitude VARCHAR(20),
  longitude VARCHAR(20),
  status ENUM('Pending','Success','Failed') DEFAULT 'Pending',
  api_response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE,
  FOREIGN KEY (operator_id) REFERENCES operators(operator_id),

  INDEX idx_user_bill (user_id),
  INDEX idx_transaction_bill (transaction_id)
);

CREATE TABLE pan_applications (
  application_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  father_name VARCHAR(100) NOT NULL,
  mother_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  mobile_number VARCHAR(15) NOT NULL,
  email_address VARCHAR(100) NOT NULL,
  aadhar_number VARCHAR(12) NOT NULL,
  full_address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(6) NOT NULL,
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
);

CREATE TABLE pan_documents (
  document_id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  document_type ENUM('Aadhaar', 'Address_Proof', 'DOB_Proof', 'Passport_Photo') NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES pan_applications(application_id) ON DELETE CASCADE
);

CREATE TABLE aadhar_enrollments (
  enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender ENUM('Male','Female','Other') NOT NULL,
  house_no_street VARCHAR(255),
  area_village_locality VARCHAR(255),
  city_taluka VARCHAR(100),
  district VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(6),
  mobile_number VARCHAR(15) NOT NULL,
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
);

CREATE TABLE verification_otps (
  otp_id INT AUTO_INCREMENT PRIMARY KEY,
  mobile_number VARCHAR(15) NOT NULL,
  otp_code VARCHAR(10) NOT NULL,
  purpose VARCHAR(50) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pan_corrections (
  correction_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  pan_number VARCHAR(10) NOT NULL,
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
);

CREATE TABLE pan_correction_documents (
  document_id INT AUTO_INCREMENT PRIMARY KEY,
  correction_id INT NOT NULL,
  document_type ENUM('Proof_of_Name', 'Identity_Proof', 'Proof_of_DOB', 'Photo_Sign') NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (correction_id) REFERENCES pan_corrections(correction_id) ON DELETE CASCADE
);


CREATE TABLE voter_applications (
  application_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender ENUM('Male','Female','Other') NOT NULL,
  aadhar_number VARCHAR(12) NOT NULL,
  house_no VARCHAR(255),
  assembly_constituency VARCHAR(255),
  city VARCHAR(100),
  district VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(6),
  mobile_number VARCHAR(15) NOT NULL,
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
);

CREATE TABLE voter_documents (
  document_id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  document_type ENUM('Aadhaar', 'Address_Proof', 'DOB_Proof', 'Passport_Photo') NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES voter_applications(application_id) ON DELETE CASCADE
);

CREATE TABLE voter_corrections (
  correction_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  voter_id_number VARCHAR(20) NOT NULL,
  aadhar_number VARCHAR(12) NOT NULL,
  mobile_number VARCHAR(15) NOT NULL,
  corrected_name VARCHAR(100) NULL,
  corrected_dob DATE NULL,
  corrected_gender VARCHAR(20) NULL,
  corrected_address TEXT NULL,
  corrected_state VARCHAR(100) NULL,
  corrected_pincode VARCHAR(6) NULL,
  correction_type VARCHAR(50) NULL,
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
);

CREATE TABLE voter_correction_documents (
  document_id INT AUTO_INCREMENT PRIMARY KEY,
  correction_id INT NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (correction_id) REFERENCES voter_corrections(correction_id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
