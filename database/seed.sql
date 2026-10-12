-- HDP-HRMS Seed Data

USE hdp_hrms;

-- Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'ADMIN', 'Quản trị viên hệ thống'),
(2, 'HR', 'Nhân sự'),
(3, 'VIEWER', 'Người xem');

-- Permissions (Basic set)
INSERT INTO permissions (id, resource, action, description) VALUES
(1, 'employees', 'view', 'Xem nhân viên'),
(2, 'employees', 'create', 'Thêm nhân viên'),
(3, 'employees', 'edit', 'Sửa nhân viên'),
(4, 'employees', 'delete', 'Xóa nhân viên'),
(5, 'departments', 'view', 'Xem phòng ban'),
(6, 'departments', 'create', 'Thêm phòng ban'),
(7, 'departments', 'edit', 'Sửa phòng ban'),
(8, 'departments', 'delete', 'Xóa phòng ban');

-- Role Permissions
-- Admin gets all
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- HR gets most
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions WHERE action IN ('view', 'create', 'edit');

-- Viewer gets view only
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE action = 'view';

-- Departments
INSERT INTO departments (id, code, name, description) VALUES
(1, 'BGH', 'Ban Giám hiệu', 'Ban Giám hiệu trường'),
(2, 'TCCB', 'Phòng Tổ chức Cán bộ', 'Phòng Tổ chức Cán bộ'),
(3, 'CNTT', 'Khoa CNTT', 'Khoa Công nghệ thông tin');

-- Positions
INSERT INTO positions (id, code, name, level) VALUES
(1, 'HT', 'Hiệu trưởng', 1),
(2, 'PHT', 'Phó Hiệu trưởng', 2),
(3, 'TP', 'Trưởng phòng', 3),
(4, 'GV', 'Giảng viên', 4);

-- Employees
INSERT INTO employees (id, code, full_name, date_of_birth, gender, email, department_id, position_id, status) VALUES
(1, 'EMP001', 'Nguyễn Văn A', '1980-01-01', 'male', 'nva@hpu.edu.vn', 1, 1, 'active'),
(2, 'EMP002', 'Trần Thị B', '1985-02-02', 'female', 'ttb@hpu.edu.vn', 2, 3, 'active'),
(3, 'EMP003', 'Lê Văn C', '1990-03-03', 'male', 'lvc@hpu.edu.vn', 3, 4, 'active');

-- Users
-- Password for all is their username + @123 (e.g. Admin@123)
-- Uses proper bcrypt hashes for cost 12
INSERT INTO users (id, username, password_hash, employee_id, role_id) VALUES
(1, 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5tFGd2/eoC', 1, 1),
(2, 'hr_manager', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 2, 2),
(3, 'viewer', '$2b$12$tVk.GX7P5x5Gv.rqMxN/TO7i4Gk.3oJ5PEb4qLR4IXGIXFMfZYUm', 3, 3);
