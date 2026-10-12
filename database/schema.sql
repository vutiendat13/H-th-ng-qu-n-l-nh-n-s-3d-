-- HDP-HRMS Database Schema
-- Trường Đại học Hải Phòng - Hệ thống Quản lý Nhân sự

CREATE DATABASE IF NOT EXISTS hdp_hrms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hdp_hrms;

-- Table: departments
CREATE TABLE departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  parent_id INT NULL,
  head_employee_id INT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_dept_parent (parent_id),
  INDEX idx_dept_active (is_active)
);

-- Table: positions
CREATE TABLE positions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  level INT DEFAULT 1,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: employees
CREATE TABLE employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  date_of_birth DATE,
  gender ENUM('male','female','other'),
  id_card VARCHAR(20),
  phone VARCHAR(20),
  email VARCHAR(100) UNIQUE,
  address TEXT,
  department_id INT,
  position_id INT,
  hire_date DATE,
  status ENUM('active','inactive','on_leave','resigned') DEFAULT 'active',
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_emp_dept (department_id),
  INDEX idx_emp_pos (position_id),
  INDEX idx_emp_status (status),
  INDEX idx_emp_code (code),
  FULLTEXT INDEX ft_emp_name (full_name)
);

-- Table: education
CREATE TABLE education (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  degree ENUM('high_school','associate','bachelor','master','doctor','professor') NOT NULL,
  major VARCHAR(200),
  institution VARCHAR(300),
  graduation_year INT,
  is_main TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_edu_emp (employee_id)
);

-- Table: contracts
CREATE TABLE contracts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  contract_number VARCHAR(50) UNIQUE NOT NULL,
  contract_type ENUM('indefinite','fixed_term_1y','fixed_term_3y','probation','part_time') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  salary DECIMAL(15,2),
  status ENUM('active','expired','terminated','pending') DEFAULT 'pending',
  signed_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_contract_emp (employee_id),
  INDEX idx_contract_status (status),
  INDEX idx_contract_end (end_date)
);

-- Table: work_history
CREATE TABLE work_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  department_id INT,
  position_id INT,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  decision_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_wh_emp (employee_id)
);

-- Table: rewards
CREATE TABLE rewards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  reward_type VARCHAR(100) NOT NULL,
  award_date DATE NOT NULL,
  content TEXT,
  decision_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reward_emp (employee_id)
);

-- Table: discipline
CREATE TABLE discipline (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  form VARCHAR(100) NOT NULL,
  discipline_date DATE NOT NULL,
  reason TEXT,
  decision_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_disc_emp (employee_id)
);

-- Table: leaves
CREATE TABLE leaves (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  leave_type ENUM('annual','sick','maternity','paternity','unpaid','other') NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  reason TEXT,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  approved_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_leave_emp (employee_id),
  INDEX idx_leave_status (status)
);

-- Table: roles
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: permissions
CREATE TABLE permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  resource VARCHAR(100) NOT NULL,
  action ENUM('view','create','edit','delete') NOT NULL,
  description VARCHAR(200),
  UNIQUE KEY uq_perm (resource, action)
);

-- Table: role_permissions
CREATE TABLE role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (role_id, permission_id)
);

-- Table: users
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  employee_id INT NULL,
  role_id INT NOT NULL,
  status ENUM('active','inactive') DEFAULT 'active',
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_role (role_id),
  INDEX idx_user_status (status)
);

-- Table: activity_logs
CREATE TABLE activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  resource_id INT NULL,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_log_user (user_id),
  INDEX idx_log_created (created_at)
);

-- Foreign Keys
ALTER TABLE departments
  ADD CONSTRAINT fk_dept_parent FOREIGN KEY (parent_id) REFERENCES departments(id) ON DELETE SET NULL;

ALTER TABLE employees
  ADD CONSTRAINT fk_emp_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_emp_pos FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL;

ALTER TABLE departments
  ADD CONSTRAINT fk_dept_head FOREIGN KEY (head_employee_id) REFERENCES employees(id) ON DELETE SET NULL;

ALTER TABLE education
  ADD CONSTRAINT fk_edu_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;

ALTER TABLE contracts
  ADD CONSTRAINT fk_contract_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;

ALTER TABLE work_history
  ADD CONSTRAINT fk_wh_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_wh_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_wh_pos FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL;

ALTER TABLE rewards
  ADD CONSTRAINT fk_reward_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;

ALTER TABLE discipline
  ADD CONSTRAINT fk_disc_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;

ALTER TABLE leaves
  ADD CONSTRAINT fk_leave_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_leave_approver FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL;

ALTER TABLE role_permissions
  ADD CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_rp_perm FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE;

ALTER TABLE users
  ADD CONSTRAINT fk_user_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id);

ALTER TABLE activity_logs
  ADD CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
