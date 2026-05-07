use auth_db;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(64) NOT NULL,
    last_name VARCHAR(64) NOT NULL,
    username VARCHAR(64) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(256) NOT NULL,
    is_active BOOLEAN,
    is_admin BOOLEAN,
    email_verified BOOLEAN,
    phone_verified BOOLEAN,
    login_attempts INT,
    locked_until DATETIME,
    created_at DATETIME,
    updated_at DATETIME,
    last_login DATETIME
);

CREATE TABLE otp_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    otp_type VARCHAR(10) NOT NULL,
    code VARCHAR(10) NOT NULL,
    is_used BOOLEAN,
    expires_at DATETIME NOT NULL,
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

drop table if exists users;
drop table if exists otp_records;


select * from otp_records;




DROP TABLE IF EXISTS tbl_whether_criminal_master;
create table tbl_whether_criminal_master(
whether_criminal BOOLEAN
)	;



DROP TABLE IF EXISTS tbl_court_cases_det;			
CREATE TABLE tbl_court_cases_det (
    court_cases_refno INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    court_id INT,
    case_act_id INT,
    case_hearing_id int,
    whether_criminal boolean,
    year_id INT,
    region_id INT,
    court_cases_num INT CHECK(court_cases_num BETWEEN 1 AND 9999999999),
    
    created_by VARCHAR(50),
    created_date DATETIME,
    updated_by VARCHAR(50),
    updated_date DATETIME,
    status_ BOOLEAN DEFAULT NULL,
	  upload_id int DEFAULT NULL,
  	is_approved tinyint(1) DEFAULT NULL,
    CONSTRAINT fk_court_tbl_court_cases_det FOREIGN KEY ( court_id) REFERENCES tbl_court_master ( court_id),
    CONSTRAINT fk_case_act_tbl_court_cases_det FOREIGN KEY (case_act_id) REFERENCES tbl_case_acts_master ( case_act_id),
    CONSTRAINT fk_case_hearing_tbl_court_cases_det FOREIGN KEY ( case_hearing_id) REFERENCES tbl_case_hearing_master ( case_hearing_id),
    CONSTRAINT fk_year_tbl_court_cases_det FOREIGN KEY (year_id) REFERENCES tbl_year_master (year_id),
    CONSTRAINT fk_region_tbl_court_cases_det FOREIGN KEY (region_id) REFERENCES tbl_region_master (region_id),
    CONSTRAINT uq_court_cases_det UNIQUE (court_id,case_act_id,case_hearing_id,year_id,region_id)
);


drop table tbl_example_ah;









-- In MySQL terminal
CREATE DATABASE dentall_db;
USE dentall_db;

DROP table if exists orders; 
DROP table if exists leads; 



(
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