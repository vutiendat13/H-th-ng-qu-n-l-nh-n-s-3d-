# HDP-HRMS — AI Context File

## Project
Hệ thống Quản lý Nhân sự Trường Đại học Hải Phòng

## Tech Stack
- Frontend: HTML5 + CSS3 + Vanilla JS + Three.js + Chart.js
- Backend: Python Flask
- Database: MySQL
- Auth: JWT (Flask-JWT-Extended) + bcrypt

## Architecture
- Flask serves both API (under /api/) and static frontend HTML
- REST API with JSON responses
- JWT tokens stored in localStorage
- RBAC: ADMIN > HR > VIEWER

## Key Files
- backend/main.py: Flask app entry point
- backend/app/__init__.py: App factory
- database/schema.sql: Database schema
- database/seed.sql: Test data

## Demo Accounts
- admin / Admin@123 (ADMIN role)
- hr_manager / Hr@123456 (HR role)
- viewer / Viewer@123 (VIEWER role)

## Running
1. Create MySQL database: hdp_hrms
2. Run: mysql -u root -p hdp_hrms < database/schema.sql
3. Run: mysql -u root -p hdp_hrms < database/seed.sql
4. Copy .env.example to .env and fill in values
5. pip install -r requirements.txt
6. cd backend && python main.py
7. Open http://localhost:5000
