from flask import Blueprint
from datetime import datetime, date, timedelta
from app.database import execute_query, execute_one
from app.utils.response import success_response, error_response
from app.middleware.auth_middleware import token_required

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/summary', methods=['GET'])
@token_required
def get_summary():
    try:
        total = execute_one("SELECT COUNT(*) as cnt FROM employees")['cnt']
        active = execute_one("SELECT COUNT(*) as cnt FROM employees WHERE status = 'active'")['cnt']
        on_leave = execute_one("SELECT COUNT(*) as cnt FROM employees WHERE status = 'on_leave'")['cnt']
        depts = execute_one("SELECT COUNT(*) as cnt FROM departments WHERE is_active = 1")['cnt']
        positions = execute_one("SELECT COUNT(*) as cnt FROM positions WHERE is_active = 1")['cnt']

        # Contracts expiring within 60 days
        today = date.today()
        future = today + timedelta(days=60)
        expiring = execute_one(
            "SELECT COUNT(*) as cnt FROM contracts WHERE status='active' AND end_date IS NOT NULL AND end_date BETWEEN %s AND %s",
            (today, future)
        )['cnt']

        # New hires this month
        first_day = today.replace(day=1)
        new_month = execute_one(
            "SELECT COUNT(*) as cnt FROM employees WHERE hire_date >= %s",
            (first_day,)
        )['cnt']

        return success_response({
            'total_employees': total,
            'active_employees': active,
            'on_leave_employees': on_leave,
            'expiring_contracts': expiring,
            'total_departments': depts,
            'total_positions': positions,
            'new_this_month': new_month
        })
    except Exception as e:
        return error_response(f"Error fetching summary: {str(e)}", 500)


@dashboard_bp.route('/employee-stats', methods=['GET'])
@token_required
def get_employee_stats():
    try:
        today = date.today()
        labels = []
        new_hires = []
        resigned = []

        for i in range(11, -1, -1):
            # Calculate month offset
            month = today.month - i
            year = today.year
            while month <= 0:
                month += 12
                year -= 1
            label = f"T{month}/{year}"
            labels.append(label)

            month_start = date(year, month, 1)
            if month == 12:
                month_end = date(year + 1, 1, 1)
            else:
                month_end = date(year, month + 1, 1)

            hires = execute_one(
                "SELECT COUNT(*) as cnt FROM employees WHERE hire_date >= %s AND hire_date < %s",
                (month_start, month_end)
            )['cnt']
            new_hires.append(hires)

            res = execute_one(
                "SELECT COUNT(*) as cnt FROM employees WHERE status = 'resigned' AND updated_at >= %s AND updated_at < %s",
                (month_start, month_end)
            )['cnt']
            resigned.append(res)

        return success_response({
            'labels': labels,
            'new_hires': new_hires,
            'resigned': resigned
        })
    except Exception as e:
        return error_response(f"Error fetching employee stats: {str(e)}", 500)


@dashboard_bp.route('/department-stats', methods=['GET'])
@token_required
def get_department_stats():
    try:
        rows = execute_query("""
            SELECT d.name as department, COUNT(e.id) as count
            FROM departments d
            LEFT JOIN employees e ON e.department_id = d.id AND e.status = 'active'
            WHERE d.is_active = 1
            GROUP BY d.id, d.name
            ORDER BY count DESC
        """)

        total = sum(r['count'] for r in rows) or 1
        result = []
        for r in rows:
            result.append({
                'department': r['department'],
                'count': r['count'],
                'percentage': round(r['count'] / total * 100, 1)
            })

        return success_response(result)
    except Exception as e:
        return error_response(f"Error fetching department stats: {str(e)}", 500)


@dashboard_bp.route('/contract-expiring', methods=['GET'])
@token_required
def get_contract_expiring():
    try:
        today = date.today()
        future = today + timedelta(days=60)
        rows = execute_query("""
            SELECT c.id, e.full_name as employee_name, e.code as employee_code,
                   c.contract_number, c.end_date, c.contract_type,
                   DATEDIFF(c.end_date, CURDATE()) as days_until_expiry
            FROM contracts c
            JOIN employees e ON c.employee_id = e.id
            WHERE c.status = 'active'
              AND c.end_date IS NOT NULL
              AND c.end_date BETWEEN %s AND %s
            ORDER BY c.end_date ASC
        """, (today, future))

        # Convert date objects to strings
        for r in rows:
            if r.get('end_date'):
                r['end_date'] = r['end_date'].isoformat() if hasattr(r['end_date'], 'isoformat') else str(r['end_date'])

        return success_response(rows)
    except Exception as e:
        return error_response(f"Error fetching expiring contracts: {str(e)}", 500)


@dashboard_bp.route('/recent-activity', methods=['GET'])
@token_required
def get_recent_activity():
    try:
        rows = execute_query("""
            SELECT al.id, al.action, al.resource, al.resource_id, al.details,
                   al.created_at, u.username
            FROM activity_logs al
            LEFT JOIN users u ON al.user_id = u.id
            ORDER BY al.created_at DESC
            LIMIT 20
        """)

        for r in rows:
            if r.get('created_at'):
                r['created_at'] = r['created_at'].isoformat() if hasattr(r['created_at'], 'isoformat') else str(r['created_at'])

        return success_response(rows)
    except Exception as e:
        return error_response(f"Error fetching activity: {str(e)}", 500)


@dashboard_bp.route('/new-employees', methods=['GET'])
@token_required
def get_new_employees():
    try:
        rows = execute_query("""
            SELECT e.id, e.code, e.full_name, e.hire_date, e.status,
                   d.name as department_name, p.name as position_name
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN positions p ON e.position_id = p.id
            ORDER BY e.hire_date DESC, e.created_at DESC
            LIMIT 5
        """)

        for r in rows:
            if r.get('hire_date'):
                r['hire_date'] = r['hire_date'].isoformat() if hasattr(r['hire_date'], 'isoformat') else str(r['hire_date'])

        return success_response(rows)
    except Exception as e:
        return error_response(f"Error fetching new employees: {str(e)}", 500)
