-- Database schema for Land & Property and Business & Social Services

-- 1. 7/12 Extract
CREATE TABLE IF NOT EXISTS `service_712_extract` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `aadhaar_number` VARCHAR(12) NOT NULL,
    `mobile_number` VARCHAR(10) NOT NULL,
    `district` VARCHAR(100) NOT NULL,
    `taluka` VARCHAR(100) NOT NULL,
    `village` VARCHAR(100) NOT NULL,
    `survey_number` VARCHAR(50) NOT NULL,
    `aadhaar_card_url` VARCHAR(255),
    `land_document_url` VARCHAR(255),
    `photo_url` VARCHAR(255),
    `status` ENUM('Pending', 'Processing', 'Completed', 'Rejected') DEFAULT 'Pending',
    `reference_id` VARCHAR(20) UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 8A Extract
CREATE TABLE IF NOT EXISTS `service_8a_extract` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `aadhaar_number` VARCHAR(12) NOT NULL,
    `mobile_number` VARCHAR(10) NOT NULL,
    `district` VARCHAR(100) NOT NULL,
    `taluka` VARCHAR(100) NOT NULL,
    `village` VARCHAR(100) NOT NULL,
    `account_number` VARCHAR(50) NOT NULL,
    `aadhaar_card_url` VARCHAR(255),
    `holding_document_url` VARCHAR(255),
    `photo_url` VARCHAR(255),
    `status` ENUM('Pending', 'Processing', 'Completed', 'Rejected') DEFAULT 'Pending',
    `reference_id` VARCHAR(20) UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Property Tax
CREATE TABLE IF NOT EXISTS `service_property_tax` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `aadhaar_number` VARCHAR(12) NOT NULL,
    `mobile_number` VARCHAR(10) NOT NULL,
    `mobile_no_payment` VARCHAR(10),
    `property_id` VARCHAR(100) NOT NULL,
    `district` VARCHAR(100) NOT NULL,
    `taluka` VARCHAR(100) NOT NULL,
    `village` VARCHAR(100) NOT NULL,
    `tax_type` VARCHAR(50),
    `amount` DECIMAL(15, 2),
    `payment_method` VARCHAR(50),
    `aadhaar_card_url` VARCHAR(255),
    `tax_bill_url` VARCHAR(255),
    `status` ENUM('Pending', 'Processing', 'Completed', 'Rejected') DEFAULT 'Pending',
    `reference_id` VARCHAR(20) UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Ferfar Application
CREATE TABLE IF NOT EXISTS `service_ferfar_application` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `aadhaar_number` VARCHAR(12) NOT NULL,
    `mobile_number` VARCHAR(10) NOT NULL,
    `district` VARCHAR(100) NOT NULL,
    `taluka` VARCHAR(100) NOT NULL,
    `village` VARCHAR(100) NOT NULL,
    `survey_number` VARCHAR(50) NOT NULL,
    `mutation_type` VARCHAR(100) NOT NULL,
    `aadhaar_card_url` VARCHAR(255),
    `index_2_url` VARCHAR(255),
    `death_cert_url` VARCHAR(255),
    `ferfar_cert_url` VARCHAR(255),
    `status` ENUM('Pending', 'Processing', 'Completed', 'Rejected') DEFAULT 'Pending',
    `reference_id` VARCHAR(20) UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Udyam Registration
CREATE TABLE IF NOT EXISTS `service_udyam_registration` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `aadhaar_number` VARCHAR(12) NOT NULL,
    `pan_number` VARCHAR(10) NOT NULL,
    `mobile_number` VARCHAR(10) NOT NULL,
    `email` VARCHAR(255),
    `organization_type` VARCHAR(100),
    `gender` VARCHAR(20),
    `category` VARCHAR(50),
    `disability` VARCHAR(10) DEFAULT 'No',
    `unit_name` VARCHAR(255) NOT NULL,
    `location` VARCHAR(255),
    `office_address` TEXT,
    `bank_name` VARCHAR(255),
    `ifsc` VARCHAR(20),
    `account_number` VARCHAR(50),
    `business_activity` VARCHAR(255),
    `employees_count` INT,
    `investment` DECIMAL(15, 2),
    `turnover` DECIMAL(15, 2),
    `registration_date` DATE,
    `aadhaar_card_url` VARCHAR(255),
    `pan_card_url` VARCHAR(255),
    `bank_passbook_url` VARCHAR(255),
    `photo_url` VARCHAR(255),
    `status` ENUM('Pending', 'Processing', 'Completed', 'Rejected') DEFAULT 'Pending',
    `reference_id` VARCHAR(20) UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. PM Kisan
CREATE TABLE IF NOT EXISTS `service_pm_kisan` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `farmer_name` VARCHAR(255) NOT NULL,
    `aadhaar_number` VARCHAR(12) NOT NULL,
    `mobile_number` VARCHAR(10) NOT NULL,
    `gender` VARCHAR(20) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `state` VARCHAR(100) NOT NULL,
    `district` VARCHAR(100) NOT NULL,
    `taluka` VARCHAR(100) NOT NULL,
    `village` VARCHAR(100) NOT NULL,
    `survey_number` VARCHAR(50) NOT NULL,
    `land_area` VARCHAR(50) NOT NULL,
    `ownership_type` VARCHAR(50) DEFAULT 'Single',
    `bank_name` VARCHAR(255) NOT NULL,
    `account_number` VARCHAR(50) NOT NULL,
    `ifsc_code` VARCHAR(20) NOT NULL,
    `land_712_url` VARCHAR(255),
    `bank_passbook_url` VARCHAR(255),
    `status` ENUM('Pending', 'Processing', 'Completed', 'Rejected') DEFAULT 'Pending',
    `reference_id` VARCHAR(20) UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Senior Citizen Certificate
CREATE TABLE IF NOT EXISTS `service_senior_citizen` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `aadhaar_number` VARCHAR(12) NOT NULL,
    `dob` DATE NOT NULL,
    `gender` VARCHAR(20) NOT NULL,
    `mobile_number` VARCHAR(10) NOT NULL,
    `email` VARCHAR(255),
    `house_no` VARCHAR(100),
    `street` VARCHAR(255),
    `village` VARCHAR(100) NOT NULL,
    `taluka` VARCHAR(100) NOT NULL,
    `district` VARCHAR(100) NOT NULL,
    `pincode` VARCHAR(6) NOT NULL,
    `aadhaar_card_url` VARCHAR(255),
    `age_proof_url` VARCHAR(255),
    `address_proof_url` VARCHAR(255),
    `photo_url` VARCHAR(255),
    `status` ENUM('Pending', 'Processing', 'Completed', 'Rejected') DEFAULT 'Pending',
    `reference_id` VARCHAR(20) UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Employment Registration
CREATE TABLE IF NOT EXISTS `service_employment_registration` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `aadhaar_number` VARCHAR(12) NOT NULL,
    `dob` DATE NOT NULL,
    `gender` VARCHAR(20) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `mobile_number` VARCHAR(10) NOT NULL,
    `email` VARCHAR(255),
    `house_no` VARCHAR(100),
    `area` VARCHAR(255),
    `village` VARCHAR(100) NOT NULL,
    `taluka` VARCHAR(100) NOT NULL,
    `district` VARCHAR(100) NOT NULL,
    `pincode` VARCHAR(6) NOT NULL,
    `employment_status` VARCHAR(100) NOT NULL,
    `experience_years` INT DEFAULT 0,
    `qualification` VARCHAR(100) NOT NULL,
    `computer_skills` TEXT,
    `languages` TEXT,
    `pref_sector` VARCHAR(255) NOT NULL,
    `aadhaar_card_url` VARCHAR(255),
    `education_cert_url` VARCHAR(255),
    `photo_url` VARCHAR(255),
    `experience_cert_url` VARCHAR(255),
    `caste_cert_url` VARCHAR(255),
    `status` ENUM('Pending', 'Processing', 'Completed', 'Rejected') DEFAULT 'Pending',
    `reference_id` VARCHAR(20) UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Ayushman Bharat
CREATE TABLE IF NOT EXISTS `service_ayushman_bharat` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `aadhaar_number` VARCHAR(12) NOT NULL,
    `mobile_number` VARCHAR(10) NOT NULL,
    `gender` VARCHAR(20) NOT NULL,
    `dob` DATE NOT NULL,
    `state` VARCHAR(100) NOT NULL,
    `district` VARCHAR(100) NOT NULL,
    `village` VARCHAR(100) NOT NULL,
    `ration_card_number` VARCHAR(50) NOT NULL,
    `eligibility_type` VARCHAR(50),
    `is_eligible` BOOLEAN DEFAULT FALSE,
    `aadhaar_head_url` VARCHAR(255),
    `ration_card_url` VARCHAR(255),
    `address_proof_url` VARCHAR(255),
    `photo_url` VARCHAR(255),
    `secc_proof_url` VARCHAR(255),
    `status` ENUM('Pending', 'Processing', 'Completed', 'Rejected') DEFAULT 'Pending',
    `reference_id` VARCHAR(20) UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ayushman Bharat Family Members Table
CREATE TABLE IF NOT EXISTS `ayushman_family_members` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `application_id` INT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `aadhaar` VARCHAR(12) NOT NULL,
    `age` INT NOT NULL,
    `relationship` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`application_id`) REFERENCES `service_ayushman_bharat`(`id`) ON DELETE CASCADE
);
