-- Database schema for Travel Booking (Flight, Train, Bus)

-- Bus Bookings
CREATE TABLE IF NOT EXISTS `bus_bookings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `transaction_id` INT,
    `operator_name` VARCHAR(255),
    `source_city` VARCHAR(100),
    `destination_city` VARCHAR(100),
    `travel_date` DATE,
    `boarding_point` VARCHAR(255),
    `dropping_point` VARCHAR(255),
    `bus_type` VARCHAR(100),
    `seat_numbers` VARCHAR(255),
    `total_amount` DECIMAL(10, 2),
    `status` ENUM('Pending', 'Success', 'Failed', 'Cancelled') DEFAULT 'Pending',
    `pnr_number` VARCHAR(50),
    `api_reference` VARCHAR(100),
    `api_response` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES users(`user_id`) ON DELETE CASCADE
);

-- Flight Bookings (Redirect/URL based tracking)
CREATE TABLE IF NOT EXISTS `flight_bookings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `transaction_id` INT,
    `url_reference` VARCHAR(100) UNIQUE,
    `status` ENUM('Pending', 'Success', 'Failed') DEFAULT 'Pending',
    `amount` DECIMAL(10, 2),
    `pnr_number` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES users(`user_id`) ON DELETE CASCADE
);

-- Train Bookings (Redirect/URL based tracking)
CREATE TABLE IF NOT EXISTS `train_bookings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `transaction_id` INT,
    `url_reference` VARCHAR(100) UNIQUE,
    `status` ENUM('Pending', 'Success', 'Failed') DEFAULT 'Pending',
    `amount` DECIMAL(10, 2),
    `pnr_number` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES users(`user_id`) ON DELETE CASCADE
);
