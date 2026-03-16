-- Database schema for Ration Card Service

-- 1. Ration Card Applications
CREATE TABLE IF NOT EXISTS `ration_card_applications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `aadhaar_number` VARCHAR(12) NOT NULL,
    `mobile_number` VARCHAR(10) NOT NULL,
    `dob` DATE,
    `gender` VARCHAR(20),
    `house_no` VARCHAR(255),
    `street` VARCHAR(255),
    `village` VARCHAR(255),
    `district` VARCHAR(255),
    `state` VARCHAR(255),
    `pincode` VARCHAR(6),
    `duration_of_stay` VARCHAR(100),
    `total_income` DECIMAL(15, 2),
    `income_category` VARCHAR(50),
    `occupation` VARCHAR(255),
    `gas_consumer_no` VARCHAR(100),
    `gas_agency_name` VARCHAR(255),
    `gas_status` VARCHAR(50),
    `status` ENUM('Pending', 'Processing', 'Completed', 'Rejected') DEFAULT 'Pending',
    `remarks` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Ration Card Members
CREATE TABLE IF NOT EXISTS `ration_card_members` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `application_id` INT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `aadhaar` VARCHAR(12) NOT NULL,
    `dob` DATE,
    `relationship` VARCHAR(100),
    `gender` VARCHAR(20),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`application_id`) REFERENCES `ration_card_applications`(`id`) ON DELETE CASCADE
);

-- 3. Ration Card Documents
CREATE TABLE IF NOT EXISTS `ration_card_documents` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `application_id` INT NOT NULL,
    `document_type` VARCHAR(100) NOT NULL,
    `file_path` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`application_id`) REFERENCES `ration_card_applications`(`id`) ON DELETE CASCADE
);
