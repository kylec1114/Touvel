-- Touvel Travel Planning Platform Database Schema
-- Complete database structure with all required tables

CREATE DATABASE IF NOT EXISTS touvel_db;
USE touvel_db;

-- ========== USERS TABLE ==========
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  country VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  language_preference VARCHAR(10) DEFAULT 'en',
  currency_preference VARCHAR(3) DEFAULT 'HKD',
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status)
);

-- ========== TRIPS TABLE ==========
CREATE TABLE trips (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  destination_city VARCHAR(100),
  destination_country VARCHAR(100),
  destination_latitude DECIMAL(10, 8),
  destination_longitude DECIMAL(11, 8),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget_currency VARCHAR(3) DEFAULT 'HKD',
  budget_amount DECIMAL(12, 2),
  trip_type ENUM('individual', 'couple', 'family', 'group') DEFAULT 'individual',
  group_size INT DEFAULT 1,
  status ENUM('planning', 'confirmed', 'ongoing', 'completed', 'cancelled') DEFAULT 'planning',
  visibility ENUM('private', 'shared', 'public') DEFAULT 'private',
  cover_image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_dates (start_date, end_date)
);

-- ========== ITINERARIES TABLE ==========
CREATE TABLE itineraries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trip_id INT NOT NULL,
  day_number INT NOT NULL,
  date DATE,
  theme VARCHAR(100),
  budget_allocation DECIMAL(10, 2),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  INDEX idx_trip_id (trip_id),
  UNIQUE KEY unique_trip_day (trip_id, day_number)
);

-- ========== ACTIVITIES TABLE ==========
CREATE TABLE activities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  itinerary_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  activity_type VARCHAR(50),
  start_time TIME,
  end_time TIME,
  location_name VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  duration_minutes INT,
  cost DECIMAL(10, 2),
  cost_currency VARCHAR(3),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE,
  INDEX idx_itinerary_id (itinerary_id)
);

-- ========== BOOKINGS TABLE ==========
CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trip_id INT NOT NULL,
  user_id INT NOT NULL,
  booking_type ENUM('hotel', 'flight', 'car_rental', 'activity', 'restaurant', 'other') NOT NULL,
  booking_reference VARCHAR(100) UNIQUE,
  provider_name VARCHAR(255),
  item_name VARCHAR(255) NOT NULL,
  check_in_date DATE,
  check_out_date DATE,
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10, 2),
  total_price DECIMAL(12, 2),
  currency VARCHAR(3) DEFAULT 'HKD',
  booking_status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
  confirmation_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_trip_id (trip_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (booking_status)
);

-- ========== PAYMENTS TABLE ==========
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT,
  user_id INT NOT NULL,
  trip_id INT,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'HKD',
  payment_method ENUM('credit_card', 'debit_card', 'paypal', 'bank_transfer', 'digital_wallet') NOT NULL,
  payment_gateway ENUM('stripe', 'paypal', 'local_bank', 'other'),
  transaction_id VARCHAR(255) UNIQUE,
  payment_status ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
  payment_date TIMESTAMP,
  refund_amount DECIMAL(12, 2),
  refund_reason TEXT,
  refund_date TIMESTAMP,
  receipt_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (payment_status),
  INDEX idx_transaction_id (transaction_id)
);

-- ========== TRIP COLLABORATORS TABLE ==========
CREATE TABLE trip_collaborators (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trip_id INT NOT NULL,
  user_id INT NOT NULL,
  collaborator_user_id INT NOT NULL,
  role ENUM('owner', 'editor', 'viewer') DEFAULT 'viewer',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (collaborator_user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_collaborator (trip_id, collaborator_user_id),
  INDEX idx_trip_id (trip_id),
  INDEX idx_collaborator (collaborator_user_id)
);

-- ========== DESTINATIONS TABLE ==========
CREATE TABLE destinations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  country VARCHAR(100),
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  currency VARCHAR(3),
  time_zone VARCHAR(50),
  image_url TEXT,
  best_months_to_visit VARCHAR(100),
  popular_activities TEXT,
  average_budget_per_day DECIMAL(10, 2),
  rating DECIMAL(3, 2),
  reviews_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_country (country),
  INDEX idx_city (city),
  INDEX idx_featured (is_featured)
);

-- ========== ADMIN LOGS TABLE ==========
CREATE TABLE admin_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admin_user_id INT,
  action VARCHAR(255),
  table_name VARCHAR(100),
  record_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_admin_id (admin_user_id),
  INDEX idx_created_at (created_at)
);

-- ========== REVIEWS TABLE ==========
CREATE TABLE reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trip_id INT,
  destination_id INT,
  user_id INT NOT NULL,
  rating INT CHECK(rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_trip_id (trip_id),
  INDEX idx_destination_id (destination_id),
  INDEX idx_user_id (user_id)
);

-- ========== PROMO CODES TABLE ==========
CREATE TABLE promo_codes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type ENUM('percentage', 'fixed_amount') NOT NULL,
  discount_value DECIMAL(10, 2),
  max_usage INT,
  current_usage INT DEFAULT 0,
  start_date DATETIME,
  end_date DATETIME,
  min_booking_amount DECIMAL(10, 2),
  max_discount_amount DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_active (is_active)
);

-- ========== NOTIFICATIONS TABLE ==========
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  notification_type VARCHAR(50),
  title VARCHAR(255),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read)
);

-- ========== Create Indexes for Performance ==========
CREATE INDEX idx_trips_dates ON trips(start_date, end_date);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_users_created ON users(created_at);
CREATE INDEX idx_trips_created ON trips(created_at);
