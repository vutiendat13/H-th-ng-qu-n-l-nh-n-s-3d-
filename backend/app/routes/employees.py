from flask import Blueprint, request, g
from app.database import execute_query, execute_one, execute_insert, execute_update, execute_delete
from app.utils.response import success_response, error_response, paginated_response
from app.utils.pagination import get_pagination_params
from app.utils.validators import validate_required
from app.utils.activity import log_activity
from app.middleware.auth_middleware import token_required, require_role, require_permission

employees_bp = Blueprint('employees', __name__)


def _serialize_employee(emp):
    """Convert date fields to strings."""
    if emp:
        for field in ('date_of_birth', 'hire_date', 'created_at', 'updated_at'):
            if emp.get(field) and hasattr(emp[field], 'isoformat'):
                emp[field] = emp[field].isoformat()
    return emp


@employees_bp.route('', methods=['GET'])
@token_required
@require_permission('employees', 'view')
def get_employees():
    page, per_page, offset = get_pagination_params(request)
    search = request.args.get('search', '').strip()
    department_id = request.args.get('department_id', '').strip()
    position_id = request.args.get('position_id', '').strip()
    status = request.args.get('status', '').strip()
    sort_by = request.args.get('sort_by', 'e.full_name')
    sort_order = request.args.get('sort_order', 'asc').upper()

    # Whitelist sort columns
    allowed_sorts = {
        'full_name': 'e.full_name', 'code': 'e.code',
        'hire_date': 'e.hire_date', 'created_at': 'e.created_at',
        'department': 'd.name', 'position': 'p.name', 'status': 'e.status'
    }
    sort_col = allowed_sorts.get(sort_by, 'e.full_name')
    sort_dir = 'DESC' if sort_order == 'DESC' else 'ASC'

    where = "WHERE 1=1"
    params = []

    if search:
        where += " AND (e.full_name LIKE %s OR e.code LIKE %s OR e.email LIKE %s OR e.phone LIKE %s)"
        s = f"%{search}%"
        params.extend([s, s, s, s])

    if department_id:
        where += " AND e.department_id = %s"
        params.append(int(department_id))

    if position_id:
        where += " AND e.position_id = %s"
        params.append(int(position_id))

    if status:
        where += " AND e.status = %s"
        params.append(status)

    base_from = f"""
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN positions p ON e.position_id = p.id
        {where}
    """

    total = execute_one(f"SELECT COUNT(*) as total {base_from}", tuple(params))['total']

    data_query = f"""
        SELECT e.id, e.code, e.full_name, e.date_of_birth, e.gender,
               e.phone, e.email, e.status, e.hire_date,
               e.department_id, d.name as department_name,
               e.position_id, p.name as position_name
        {base_from}
        ORDER BY {sort_col} {sort_dir}
        LIMIT %s OFFSET %s
    """
    params.extend([per_page, offset])
    employees = execute_query(data_query, tuple(params))

    for emp in employees:
        _serialize_employee(emp)

    return paginated_response(employees, total, page, per_page)


@employees_bp.route('/<int:id>', methods=['GET'])
@token_required
@require_permission('employees', 'view')
def get_employee(id):
    employee = execute_one("""
        SELECT e.*, d.name as department_name, p.name as position_name
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN positions p ON e.position_id = p.id
        WHERE e.id = %s
    """, (id,))

    if not employee:
        return error_response("Không tìm thấy nhân viên", 404)

    _serialize_employee(employee)
    return success_response(employee)


@employees_bp.route('', methods=['POST'])
@token_required
@require_role('ADMIN', 'HR')
def create_employee():
    data = request.get_json()
    errors = validate_required(data, ['code', 'full_name'])
    if errors:
        return error_response("Dữ liệu không hợp lệ", 400, errors)

    if execute_one("SELECT id FROM employees WHERE code = %s", (data['code'],)):
        return error_response("Mã nhân viên đã tồn tại", 400)

    if data.get('email') and execute_one("SELECT id FROM employees WHERE email = %s", (data['email'],)):
        return error_response("Email đã được sử dụng", 400)

    query = """
        INSERT INTO employees (code, full_name, date_of_birth, gender, id_card,
                               phone, email, address, department_id, position_id,
                               hire_date, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    params = (
        data['code'], data['full_name'], data.get('date_of_birth') or None,
        data.get('gender'), data.get('id_card'), data.get('phone'),
        data.get('email'), data.get('address'),
        data.get('department_id') or None, data.get('position_id') or None,
        data.get('hire_date') or None, data.get('status', 'active')
    )

    emp_id = execute_insert(query, params)
    log_activity(g.user['id'], 'create', 'employees', emp_id,
                 f"Tạo nhân viên {data['code']} - {data['full_name']}", _get_ip())

    new_emp = execute_one("SELECT * FROM employees WHERE id = %s", (emp_id,))
    _serialize_employee(new_emp)
    return success_response(new_emp, "Thêm nhân viên thành công", 201)


@employees_bp.route('/<int:id>', methods=['PUT'])
@token_required
@require_role('ADMIN', 'HR')
def update_employee(id):
    data = request.get_json()
    employee = execute_one("SELECT id FROM employees WHERE id = %s", (id,))
    if not employee:
        return error_response("Không tìm thấy nhân viên", 404)

    if data.get('code'):
        existing = execute_one("SELECT id FROM employees WHERE code = %s AND id != %s", (data['code'], id))
        if existing:
            return error_response("Mã nhân viên đã tồn tại", 400)

    if data.get('email'):
        existing = execute_one("SELECT id FROM employees WHERE email = %s AND id != %s", (data['email'], id))
        if existing:
            return error_response("Email đã được sử dụng", 400)

    query = """
        UPDATE employees
        SET code = %s, full_name = %s, date_of_birth = %s, gender = %s,
            id_card = %s, phone = %s, email = %s, address = %s,
            department_id = %s, position_id = %s, hire_date = %s, status = %s
        WHERE id = %s
    """
    params = (
        data.get('code'), data.get('full_name'),
        data.get('date_of_birth') or None, data.get('gender'),
        data.get('id_card'), data.get('phone'), data.get('email'),
        data.get('address'), data.get('department_id') or None,
        data.get('position_id') or None, data.get('hire_date') or None,
        data.get('status', 'active'), id
    )

    execute_update(query, params)
    log_activity(g.user['id'], 'update', 'employees', id,
                 f"Cập nhật nhân viên ID {id}", _get_ip())

    updated = execute_one("""
        SELECT e.*, d.name as department_name, p.name as position_name
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN positions p ON e.position_id = p.id
        WHERE e.id = %s
    """, (id,))
    _serialize_employee(updated)
    return success_response(updated, "Cập nhật nhân viên thành công")


@employees_bp.route('/<int:id>', methods=['DELETE'])
@token_required
@require_role('ADMIN')
def delete_employee(id):
    employee = execute_one("SELECT id, full_name, code FROM employees WHERE id = %s", (id,))
    if not employee:
        return error_response("Không tìm thấy nhân viên", 404)

    # Business rules: check active contracts
    active_contracts = execute_one(
        "SELECT COUNT(*) as cnt FROM contracts WHERE employee_id = %s AND status = 'active'", (id,)
    )['cnt']
    if active_contracts > 0:
        return error_response(
            "Không thể xóa nhân viên đang có hợp đồng hiệu lực. Vui lòng kết thúc hợp đồng trước.", 400
        )

    # Soft delete
    execute_update("UPDATE employees SET status = 'resigned' WHERE id = %s", (id,))
    log_activity(g.user['id'], 'delete', 'employees', id,
                 f"Xóa nhân viên {employee['code']} - {employee['full_name']}", _get_ip())

    return success_response(None, "Đã xóa nhân viên thành công")


# ── Sub-resources ────────────────────────────────────────────────

@employees_bp.route('/<int:id>/education', methods=['GET'])
@token_required
@require_permission('employees', 'view')
def get_education(id):
    if not execute_one("SELECT id FROM employees WHERE id = %s", (id,)):
        return error_response("Không tìm thấy nhân viên", 404)
    rows = execute_query("SELECT * FROM education WHERE employee_id = %s ORDER BY graduation_year DESC", (id,))
    return success_response(rows)


@employees_bp.route('/<int:id>/education', methods=['POST'])
@token_required
@require_role('ADMIN', 'HR')
def add_education(id):
    if not execute_one("SELECT id FROM employees WHERE id = %s", (id,)):
        return error_response("Không tìm thấy nhân viên", 404)
    data = request.get_json()
    errors = validate_required(data, ['degree'])
    if errors:
        return error_response("Dữ liệu không hợp lệ", 400, errors)

    edu_id = execute_insert("""
        INSERT INTO education (employee_id, degree, major, institution, graduation_year, is_main)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (id, data['degree'], data.get('major'), data.get('institution'),
          data.get('graduation_year'), data.get('is_main', False)))
    return success_response({'id': edu_id}, "Thêm trình độ thành công", 201)


@employees_bp.route('/<int:id>/contracts', methods=['GET'])
@token_required
@require_permission('employees', 'view')
def get_contracts(id):
    if not execute_one("SELECT id FROM employees WHERE id = %s", (id,)):
        return error_response("Không tìm thấy nhân viên", 404)
    rows = execute_query("SELECT * FROM contracts WHERE employee_id = %s ORDER BY start_date DESC", (id,))
    for r in rows:
        for f in ('start_date', 'end_date', 'signed_date', 'created_at'):
            if r.get(f) and hasattr(r[f], 'isoformat'):
                r[f] = r[f].isoformat()
    return success_response(rows)


@employees_bp.route('/<int:id>/work-history', methods=['GET'])
@token_required
@require_permission('employees', 'view')
def get_work_history(id):
    if not execute_one("SELECT id FROM employees WHERE id = %s", (id,)):
        return error_response("Không tìm thấy nhân viên", 404)
    rows = execute_query("""
        SELECT wh.*, d.name as department_name, p.name as position_name
        FROM work_history wh
        LEFT JOIN departments d ON wh.department_id = d.id
        LEFT JOIN positions p ON wh.position_id = p.id
        WHERE wh.employee_id = %s
        ORDER BY wh.start_date DESC
    """, (id,))
    for r in rows:
        for f in ('start_date', 'end_date', 'created_at'):
            if r.get(f) and hasattr(r[f], 'isoformat'):
                r[f] = r[f].isoformat()
    return success_response(rows)


@employees_bp.route('/<int:id>/rewards', methods=['GET'])
@token_required
@require_permission('employees', 'view')
def get_rewards(id):
    rows = execute_query("SELECT * FROM rewards WHERE employee_id = %s ORDER BY award_date DESC", (id,))
    for r in rows:
        if r.get('award_date') and hasattr(r['award_date'], 'isoformat'):
            r['award_date'] = r['award_date'].isoformat()
    return success_response(rows)


@employees_bp.route('/<int:id>/discipline', methods=['GET'])
@token_required
@require_permission('employees', 'view')
def get_discipline(id):
    rows = execute_query("SELECT * FROM discipline WHERE employee_id = %s ORDER BY discipline_date DESC", (id,))
    for r in rows:
        if r.get('discipline_date') and hasattr(r['discipline_date'], 'isoformat'):
            r['discipline_date'] = r['discipline_date'].isoformat()
    return success_response(rows)


@employees_bp.route('/<int:id>/leaves', methods=['GET'])
@token_required
@require_permission('employees', 'view')
def get_leaves(id):
    rows = execute_query("SELECT * FROM leaves WHERE employee_id = %s ORDER BY from_date DESC", (id,))
    for r in rows:
        for f in ('from_date', 'to_date', 'created_at'):
            if r.get(f) and hasattr(r[f], 'isoformat'):
                r[f] = r[f].isoformat()
    return success_response(rows)


def _get_ip():
    from flask import request as req
    return req.remote_addr or '127.0.0.1'
