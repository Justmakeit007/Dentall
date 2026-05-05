CREATE DATABASE dentall_db;
USE dentall_db;

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  razorpay_order_id VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  customer_address TEXT,
  customer_pincode VARCHAR(10),
  customer_city VARCHAR(100),
  customer_state VARCHAR(100),
  items_json TEXT,
  subtotal DECIMAL(10,2),
  shipping_charge DECIMAL(10,2),
  total DECIMAL(10,2),
  awb_number VARCHAR(100),
  shiprocket_order_id VARCHAR(100),
  status VARCHAR(50),
  created_at DATETIME
);

CREATE TABLE IF NOT EXISTS leads (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100),
  email      VARCHAR(150) UNIQUE,
  phone      VARCHAR(20),
  created_at DATETIME
);