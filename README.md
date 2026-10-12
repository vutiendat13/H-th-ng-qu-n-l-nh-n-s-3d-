# HDP-HRMS — Hệ thống Quản lý Nhân sự Trường Đại học Hải Phòng

> **Hai Phong University Human Resource Management System**  
> Phần mềm quản lý nhân sự toàn diện dành cho Trường Đại học Hải Phòng

---

## 📋 Tổng quan

HDP-HRMS là hệ thống quản lý nhân sự web-based, được xây dựng cho Phòng Tổ chức Cán bộ của Trường Đại học Hải Phòng. Hệ thống cung cấp đầy đủ các chức năng:

- Quản lý hồ sơ nhân sự
- Quản lý đơn vị / phòng ban
- Quản lý hợp đồng lao động
- Quản lý khen thưởng & kỷ luật
- Quản lý nghỉ phép
- Dashboard & Báo cáo thống kê
- Phân quyền theo vai trò (ADMIN / HR / VIEWER)

---

## 🛠️ Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript, Three.js, Chart.js |
| Backend | Python 3.10+, Flask 3.x |
| Database | MySQL 8.x |
| Authentication | JWT (Flask-JWT-Extended), bcrypt |
| Icons | Lucide Icons |

---

## 📂 Cấu trúc Project

```
HDP-HRMS/
├── frontend/               # Frontend (HTML/CSS/JS)
│   ├── pages/              # HTML pages
│   ├── css/                # Stylesheets (design system)
│   ├── js/                 # JavaScript modules
│   │   ├── ui/             # UI components (toast, modal, sidebar...)
│   │   └── pages/          # Page-specific logic
│   ├── three/              # Three.js scenes
│   └── assets/             # Images, SVGs
│
├── backend/                # Python Flask backend
│   ├── app/
│   │   ├── routes/         # API route blueprints
│   │   ├── middleware/      # Auth & error handlers
│   │   └── utils/          # Helper utilities
│   ├── scripts/            # Utility scripts (init_db.py)
│   └── main.py             # Entry point
│
├── database/               # Database files
│   ├── schema.sql          # Table definitions
│   └── seed.sql            # Sample data
│
├── tests/                  # Automated tests
├── docs/                   # Documentation
├── .env.example            # Environment variables template
├── requirements.txt        # Python dependencies
└── PROGRESS.md             # Build progress tracking
```

---

## 🚀 Hướng dẫn Cài đặt

### Yêu cầu hệ thống

- Python 3.10+
- MySQL 8.0+
- pip
- Web browser (Chrome/Firefox/Edge)

### 1. Clone / Download project

```bash
# Điều hướng vào thư mục project
cd "HDP-HRMS — HỆ THỐNG QUẢN LÝ NHÂN SỰ TRƯỜNG ĐẠI HỌC HẢI PHÒNG"
```

### 2. Cài đặt Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Thiết lập MySQL

Đăng nhập MySQL và tạo database:

```sql
CREATE DATABASE hdp_hrms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Import schema:

```bash
mysql -u root -p hdp_hrms < database/schema.sql
```

### 4. Cấu hình Environment

```bash
# Copy file mẫu
cp .env.example .env

# Chỉnh sửa .env với thông tin MySQL của bạn
```

Nội dung `.env`:

```ini
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hdp_hrms
JWT_SECRET_KEY=your-very-long-secret-key-here
SECRET_KEY=your-flask-secret-key
FLASK_DEBUG=true
APP_HOST=0.0.0.0
APP_PORT=5000
```

### 5. Khởi tạo Database & Seed Data

```bash
cd backend
python scripts/init_db.py
```

Script này sẽ:
- Import seed data (phòng ban, chức vụ, nhân viên mẫu)
- Tạo 3 tài khoản demo với password được mã hóa bcrypt

### 6. Khởi động Server

```bash
cd backend
python main.py
```

Output mong đợi:
```
🚀 HDP-HRMS Backend running at http://0.0.0.0:5000
📊 Frontend served at http://localhost:5000
```

### 7. Truy cập hệ thống

Mở trình duyệt và truy cập: **http://localhost:5000**

---

## 👤 Tài khoản Demo

| Username | Password | Vai trò | Quyền |
|---|---|---|---|
| `admin` | `Admin@123` | ADMIN | Toàn quyền |
| `hr_manager` | `Hr@123456` | HR | Quản lý nhân sự, không xóa |
| `viewer` | `Viewer@123` | VIEWER | Chỉ xem |

---

## 🔌 API Overview

Tất cả API endpoints đều có prefix `/api/`. Xem chi tiết tại [docs/API.md](docs/API.md).

### Authentication
```
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/change-password
```

### Core Resources
```
GET|POST        /api/employees
GET|PUT|DELETE  /api/employees/<id>

GET|POST        /api/departments
GET|PUT|DELETE  /api/departments/<id>

GET|POST        /api/positions
GET|PUT|DELETE  /api/positions/<id>

GET|POST        /api/contracts
GET|PUT|DELETE  /api/contracts/<id>

GET|POST        /api/leaves
POST            /api/leaves/<id>/approve
POST            /api/leaves/<id>/reject

GET|POST        /api/rewards
GET|POST        /api/discipline
GET|POST        /api/work-history
GET|POST        /api/education
```

### Dashboard
```
GET /api/dashboard/summary
GET /api/dashboard/employee-stats
GET /api/dashboard/department-stats
GET /api/dashboard/contract-expiring
GET /api/dashboard/recent-activity
GET /api/dashboard/new-employees
```

---

## 🧪 Testing

```bash
cd backend
python -m pytest tests/ -v
```

Tests bao gồm:
- Kết nối database
- Authentication (login, logout, role enforcement)
- Employee CRUD
- Department CRUD
- Dashboard APIs
- Authorization (VIEWER không thể tạo/xóa)

---

## 📊 Database Schema

14 bảng chính:

| Bảng | Mô tả |
|---|---|
| `employees` | Hồ sơ nhân sự |
| `departments` | Đơn vị / Phòng ban |
| `positions` | Chức vụ |
| `education` | Trình độ học vấn |
| `contracts` | Hợp đồng lao động |
| `work_history` | Quá trình công tác |
| `rewards` | Khen thưởng |
| `discipline` | Kỷ luật |
| `leaves` | Nghỉ phép |
| `users` | Tài khoản hệ thống |
| `roles` | Vai trò |
| `permissions` | Quyền hạn |
| `role_permissions` | Phân quyền theo vai trò |
| `activity_logs` | Nhật ký hoạt động |

---

## 🚢 Deployment

### Development
```bash
cd backend && python main.py
```

### Production
Khuyến nghị sử dụng:
- **gunicorn** cho Python WSGI server
- **nginx** làm reverse proxy
- **MySQL** trên server riêng hoặc managed service

```bash
# Cài gunicorn
pip install gunicorn

# Chạy production
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 main:app
```

nginx config mẫu: xem `docs/nginx.conf.example`

---

## 📝 License

Phát triển nội bộ — Trường Đại học Hải Phòng  
© 2024 Trường Đại học Hải Phòng. All rights reserved.
