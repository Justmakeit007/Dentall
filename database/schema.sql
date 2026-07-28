-- In MySQL terminal
CREATE DATABASE dentall_db;
USE dentall_db;




CREATE TABLE IF NOT EXISTS orders (
   id                    INT AUTO_INCREMENT PRIMARY KEY,
   razorpay_order_id     VARCHAR(64)  NOT NULL,
   razorpay_payment_id   VARCHAR(64)  NOT NULL,
   customer_name         VARCHAR(255) NOT NULL,
   customer_email        VARCHAR(100) NOT NULL,
   customer_phone        VARCHAR(20)  NOT NULL,
   customer_address      TEXT,
    customer_city         VARCHAR(100),
   customer_state        VARCHAR(100),
    customer_pincode      VARCHAR(6),
    items_json            TEXT,
   subtotal              DECIMAL(10,2),
   shipping_charge       DECIMAL(10,2) DEFAULT 0,
   coupon_code           VARCHAR(30),
   discount_amount       DECIMAL(10,2) DEFAULT 0,
    total                 DECIMAL(10,2),
   status                VARCHAR(50)  DEFAULT 'pending',
   awb_number            VARCHAR(100),
   shiprocket_order_id   VARCHAR(100),
  created_at            DATETIME,
   UNIQUE KEY uniq_payment (razorpay_payment_id),  -- replay attack prevention
   INDEX idx_order_id    (razorpay_order_id),
   INDEX idx_email       (customer_email),
   INDEX idx_status      (status),
   INDEX idx_created     (created_at)
 );

 CREATE TABLE IF NOT EXISTS leads (
   id         INT AUTO_INCREMENT PRIMARY KEY,
   name       VARCHAR(255),
  email      VARCHAR(100) NOT NULL,
  phone      VARCHAR(20),
    created_at DATETIME,
   UNIQUE KEY uniq_email (email)
 );

  CREATE TABLE IF NOT EXISTS reviews (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  email        VARCHAR(255) NOT NULL,
  rating       TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text  TEXT NOT NULL,
  approved     BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_approved (approved),
  INDEX idx_created (created_at)
);

CREATE TABLE IF NOT EXISTS pricing (
  product_id VARCHAR(50) PRIMARY KEY,
  price      DECIMAL(10,2) NOT NULL,
  mrp        DECIMAL(10,2) NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coupons (
  code             VARCHAR(30) PRIMARY KEY,
  discount_percent DECIMAL(5,2) NOT NULL,
  active           BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wholesale_enquiries (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  full_name      VARCHAR(150) NOT NULL,
  business_name  VARCHAR(180) NOT NULL,
  email          VARCHAR(150) NOT NULL,
  phone          VARCHAR(20)  NOT NULL,
  city           VARCHAR(100) NOT NULL,
  state          VARCHAR(100) NOT NULL,
  quantity_range VARCHAR(30)  NOT NULL,
  business_type  VARCHAR(60),
  message        TEXT,
  status         VARCHAR(40) DEFAULT 'new',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email   (email),
  INDEX idx_status  (status),
  INDEX idx_created (created_at)
);
