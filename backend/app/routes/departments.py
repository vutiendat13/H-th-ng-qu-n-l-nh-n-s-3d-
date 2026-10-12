from flask import Blueprint, request, g
from app.database import execute_query, execute_one, execute_insert, execute_update, execute_delete
from app.utils.response import success_response, error_response, paginated_response
from app.utils.pagination import get_pagination_params
from app.utils.validators import validate_required
from app.utils.activity import log_activity
from app.middleware.auth_middleware import token_required, require_role, require_permission

departments_bp = Blueprint('departments', __name__)

@departments_bp.route('', methods=['GET'])
@token_required
@require_permission('departments', 'view')
def get_departments():
    page, per_page, offset = get_pagination_params(request)
    search = request.args.get('search', '')
    is_active = request.args.get('is_active')
    
    base_query = """
        FROM departments d
        LEFT JOIN employees e ON d.head_employee_id = e.id
        WHERE 1=1
    """
    params = []
    
    if search:
        base_query += " AND (d.name LIKE %s OR d.code LIKE %s)"
        params.extend([f"%{search}%"] * 2)
        
    if is_active is not None:
        base_query += " AND d.is_active = %s"
        params.append(is_active)
        
    total_query = f"SELECT COUNT(*) as total {base_query}"
    total = execute_one(total_query, tuple(params))['total']
    
    data_query = f"""
        SELECT d.*, e.full_name as head_name,
        (SELECT COUNT(*) FROM employees WHERE department_id = d.id AND status = 'active') as employee_count
        {base_query}
        ORDER BY d.id
        LIMIT %s OFFSET %s
    """
    params.extend([per_page, offset])
    departments = execute_query(data_query, tuple(params))
    
    return paginated_response(departments, total, page, per_page)

@departments_bp.route('/<int:id>', methods=['GET'])
@token_required
@require_permission('departments', 'view')
def get_department(id):
    department = execute_one("""
        SELECT d.*, e.full_name as head_name,
        (SELECT COUNT(*) FROM employees WHERE department_id = d.id AND status = 'active') as employee_count
        FROM departments d
        LEFT JOIN employees e ON d.head_employee_id = e.id
        WHERE d.id = %s
    """, (id,))
    
    if not department:
        return error_response("Department not found", 404)
        
    return success_response(department)

@departments_bp.route('', methods=['POST'])
@token_required
@require_role('ADMIN', 'HR')
def create_department():
    data = request.get_json()
    errors = validate_required(data, ['code', 'name'])
    if errors:
        return error_response("Validation error", 400, errors)
        
    if execute_one("SELECT id FROM departments WHERE code = %s", (data['code'],)):
        return error_response("Department code already exists", 400)
        
    query = """
        INSERT INTO departments (code, name, description, parent_id, head_employee_id, is_active)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    params = (
        data['code'], data['name'], data.get('description'), 
        data.get('parent_id'), data.get('head_employee_id'), data.get('is_active', 1)
    )
    
    dept_id = execute_insert(query, params)
    log_activity(g.user['id'], 'create', 'departments', dept_id, f"Created department {data['code']}")
    
    return success_response({'id': dept_id}, "Department created successfully", 201)

@departments_bp.route('/<int:id>', methods=['PUT'])
@token_required
@require_role('ADMIN', 'HR')
def update_department(id):
    data = request.get_json()
    errors = validate_required(data, ['code', 'name'])
    if errors:
        return error_response("Validation error", 400, errors)
        
    existing = execute_one("SELECT id FROM departments WHERE code = %s AND id != %s", (data['code'], id))
    if existing:
        return error_response("Department code already exists", 400)
        
    query = """
        UPDATE departments 
        SET code = %s, name = %s, description = %s, parent_id = %s, head_employee_id = %s, is_active = %s
        WHERE id = %s
    """
    params = (
        data['code'], data['name'], data.get('description'), 
        data.get('parent_id'), data.get('head_employee_id'), data.get('is_active', 1), id
    )
    
    rowcount = execute_update(query, params)
    if rowcount == 0:
        return error_response("Department not found", 404)
        
    log_activity(g.user['id'], 'update', 'departments', id, f"Updated department {data['code']}")
    
    return success_response(None, "Department updated successfully")

@departments_bp.route('/<int:id>', methods=['DELETE'])
@token_required
@require_role('ADMIN')
def delete_department(id):
    employee_count = execute_one("SELECT COUNT(*) as cnt FROM employees WHERE department_id = %s", (id,))['cnt']
    if employee_count > 0:
        return error_response("Cannot delete department with employees", 400)
        
    rowcount = execute_delete("DELETE FROM departments WHERE id = %s", (id,))
    if rowcount == 0:
        return error_response("Department not found", 404)
        
    log_activity(g.user['id'], 'delete', 'departments', id, f"Deleted department {id}")
    
    return success_response(None, "Department deleted successfully")
