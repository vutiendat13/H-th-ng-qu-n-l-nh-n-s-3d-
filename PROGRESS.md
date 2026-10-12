# HDP-HRMS — Progress Tracker

**Project**: Hệ thống Quản lý Nhân sự Trường Đại học Hải Phòng  
**Started**: 2026-10-07  
**Status**: 🚧 In Progress

---

## Phase Status

| Phase | Status | Notes |
|---|---|---|
| 1 — Database Schema & Seed | 🚧 In Progress | schema.sql + seed.sql |
| 2 — Backend Foundation | 🚧 In Progress | Flask app factory, DB layer |
| 3 — Authentication | 🚧 In Progress | JWT + bcrypt + role decorators |
| 4 — REST API Endpoints | 🚧 In Progress | All 40+ endpoints |
| 5 — Frontend Core | 🚧 In Progress | CSS design system, JS modules |
| 6 — Frontend Pages | 🚧 In Progress | 17 HTML pages |
| 7 — Page JavaScript | 🚧 In Progress | Page-specific logic |
| 8 — Three.js | 🚧 In Progress | Login bg + dashboard viz |
| 9 — Integration | ⏳ Pending | Frontend ↔ Backend |
| 10 — Testing | ⏳ Pending | Automated tests |
| 11 — Debug & Polish | ⏳ Pending | Bug fixes, UX |
| 12 — Documentation | 🚧 In Progress | README, API docs |

---

## Completed Features

- [x] Project structure defined
- [x] README.md
- [x] .env.example
- [x] requirements.txt
- [ ] database/schema.sql
- [ ] database/seed.sql
- [ ] backend/main.py
- [ ] backend/app/__init__.py
- [ ] All API routes
- [ ] Frontend CSS design system
- [ ] All HTML pages
- [ ] Three.js scenes

---

## Demo Accounts

| Account | Password | Role |
|---|---|---|
| admin | Admin@123 | ADMIN |
| hr_manager | Hr@123456 | HR |
| viewer | Viewer@123 | VIEWER |

---

## How to Run

```bash
# 1. Setup database
mysql -u root -p hdp_hrms < database/schema.sql

# 2. Init data
cd backend && python scripts/init_db.py

# 3. Start server
cd backend && python main.py

# 4. Open browser
http://localhost:5000
```

---

## Known Issues

*None yet — tracking as discovered*

---

## Next Steps

1. Complete backend routes
2. Complete frontend pages
3. Integration testing
4. Performance optimization
5. Final polish
