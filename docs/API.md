# HDP-HRMS — API Documentation

Base URL: `http://localhost:5000/api`  
Authentication: `Authorization: Bearer <jwt_token>`

---

## Authentication

### POST /api/auth/login

**Request:**
```json
{
  "username": "admin",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "ADMIN",
      "employee_id": null
    }
  },
  "message": "Đăng nhập thành công"
}
```

### GET /api/auth/me *(Requires Auth)*

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "role": "ADMIN",
    "employee_id": null,
    "permissions": ["employees.view", "employees.create", ...]
  }
}
```

### POST /api/auth/logout *(Requires Auth)*

### POST /api/auth/change-password *(Requires Auth)*

**Request:**
```json
{
  "current_password": "Admin@123",
  "new_password": "NewPass@456"
}
```

---

## Employees

### GET /api/employees *(Requires Auth)*

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| page | int | Page number (default: 1) |
| per_page | int | Items per page (default: 20, max: 100) |
| search | string | Search in name, code, email, phone |
| department_id | int | Filter by department |
| position_id | int | Filter by position |
| status | string | active\|inactive\|on_leave\|resigned |
| sort_by | string | Column to sort (default: full_name) |
| sort_order | string | asc\|desc |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "NV001",
      "full_name": "Nguyễn Văn A",
      "date_of_birth": "1985-03-15",
      "gender": "male",
      "phone": "0912345678",
      "email": "nva@hpu.edu.vn",
      "department_id": 3,
      "department_name": "Khoa Công nghệ Thông tin",
      "position_id": 7,
      "position_name": "Giảng viên chính",
      "hire_date": "2015-09-01",
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 35,
    "pages": 2
  }
}
```

### GET /api/employees/{id}

### POST /api/employees *(HR, ADMIN)*

**Request:**
```json
{
  "code": "NV036",
  "full_name": "Phạm Thị C",
  "date_of_birth": "1992-07-20",
  "gender": "female",
  "id_card": "123456789012",
  "phone": "0987654321",
  "email": "ptc@hpu.edu.vn",
  "address": "123 Lê Lợi, Hải Phòng",
  "department_id": 3,
  "position_id": 9,
  "hire_date": "2024-01-15",
  "status": "active"
}
```

### PUT /api/employees/{id} *(HR, ADMIN)*

### DELETE /api/employees/{id} *(ADMIN only)*

### GET /api/employees/{id}/education
### GET /api/employees/{id}/contracts
### GET /api/employees/{id}/work-history
### GET /api/employees/{id}/rewards
### GET /api/employees/{id}/discipline
### GET /api/employees/{id}/leaves

---

## Departments

### GET /api/departments

**Query Parameters:** page, per_page, search, is_active

**Response includes:** employee_count, head_name

### POST /api/departments *(HR, ADMIN)*

```json
{
  "code": "CNTT",
  "name": "Khoa Công nghệ Thông tin",
  "description": "...",
  "parent_id": null,
  "head_employee_id": 5
}
```

### PUT /api/departments/{id} *(HR, ADMIN)*

### DELETE /api/departments/{id} *(ADMIN only)*

> ⚠️ Cannot delete department with active employees

---

## Positions

### GET /api/positions
### POST /api/positions *(HR, ADMIN)*
### PUT /api/positions/{id} *(HR, ADMIN)*
### DELETE /api/positions/{id} *(ADMIN)*

---

## Contracts

### GET /api/contracts

**Query Parameters:** page, per_page, employee_id, status, contract_type, expiring_soon

**Response includes:** `expiring_soon: true` flag for contracts expiring within 30 days

### POST /api/contracts *(HR, ADMIN)*

```json
{
  "employee_id": 5,
  "contract_number": "HD-2024-036",
  "contract_type": "fixed_term_3y",
  "start_date": "2024-01-01",
  "end_date": "2027-01-01",
  "salary": 12000000,
  "status": "active",
  "signed_date": "2023-12-28"
}
```

> ⚠️ Validates: start_date < end_date

---

## Leaves

### GET /api/leaves

**Query Parameters:** page, per_page, employee_id, status, leave_type

### POST /api/leaves *(Auth required)*

### POST /api/leaves/{id}/approve *(HR, ADMIN)*

### POST /api/leaves/{id}/reject *(HR, ADMIN)*

---

## Dashboard

### GET /api/dashboard/summary

```json
{
  "success": true,
  "data": {
    "total_employees": 35,
    "active_employees": 32,
    "on_leave_employees": 3,
    "expiring_contracts": 5,
    "total_departments": 10,
    "total_positions": 15,
    "new_this_month": 2
  }
}
```

### GET /api/dashboard/employee-stats

```json
{
  "success": true,
  "data": {
    "labels": ["T10/2025", "T11/2025", ..., "T9/2026"],
    "new_hires": [2, 1, 3, 0, 2, 1, 0, 2, 1, 3, 1, 2],
    "resigned": [0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0]
  }
}
```

### GET /api/dashboard/department-stats

```json
{
  "success": true,
  "data": [
    {"department": "Khoa CNTT", "count": 8, "percentage": 22.9},
    {"department": "Khoa Kinh tế", "count": 6, "percentage": 17.1},
    ...
  ]
}
```

### GET /api/dashboard/contract-expiring

```json
{
  "success": true,
  "data": [
    {
      "id": 12,
      "employee_name": "Lê Văn B",
      "employee_code": "NV012",
      "contract_number": "HD-2024-012",
      "end_date": "2026-11-07",
      "days_until_expiry": 31,
      "contract_type": "fixed_term_3y"
    }
  ]
}
```

### GET /api/dashboard/recent-activity

### GET /api/dashboard/new-employees

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": ["Mã nhân viên đã tồn tại", "Email không đúng định dạng"]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Vui lòng đăng nhập để tiếp tục"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Bạn không có quyền thực hiện hành động này"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Không tìm thấy dữ liệu"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Đã xảy ra lỗi hệ thống"
}
```

---

## Role Permissions Matrix

| Resource | ADMIN | HR | VIEWER |
|---|---|---|---|
| employees.view | ✓ | ✓ | ✓ |
| employees.create | ✓ | ✓ | ✗ |
| employees.edit | ✓ | ✓ | ✗ |
| employees.delete | ✓ | ✗ | ✗ |
| departments.view | ✓ | ✓ | ✓ |
| departments.create | ✓ | ✓ | ✗ |
| departments.edit | ✓ | ✓ | ✗ |
| departments.delete | ✓ | ✗ | ✗ |
| contracts.view | ✓ | ✓ | ✓ |
| contracts.create | ✓ | ✓ | ✗ |
| contracts.edit | ✓ | ✓ | ✗ |
| contracts.delete | ✓ | ✗ | ✗ |
| leaves.view | ✓ | ✓ | ✓ |
| leaves.approve | ✓ | ✓ | ✗ |
| users.view | ✓ | ✗ | ✗ |
| users.manage | ✓ | ✗ | ✗ |
| roles.manage | ✓ | ✗ | ✗ |
