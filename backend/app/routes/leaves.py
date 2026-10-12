from flask import Blueprint, request, g
from app.database import execute_query, execute_one, execute_insert, execute_update, execute_delete
from app.utils.response import success_response, error_response
from app.utils.validators import validate_required
from app.middleware.auth_middleware import token_required, require_role

leaves_bp = Blueprint('leaves', __name__)

@leaves_bp.route('', methods=['GET'])
@token_required
def get_leaves():
    employee_id = request.args.get('employee_id')
    status = request.args.get('status')
    
    query = """
        SELECT l.*, e.full_name, a.full_name as approved_by_name
        FROM leaves l
        JOIN employees e ON l.employee_id = e.id
        LEFT JOIN employees a ON l.approved_by = a.id
        WHERE 1=1
    """
    params = []
    
    if employee_id:
        query += " AND l.employee_id = %s"
        params.append(employee_id)
    if status:
        query += " AND l.status = %s"
        params.append(status)
        
    data = execute_query(query, tuple(params))
    return success_response(data)

@leaves_bp.route('', methods=['POST'])
@token_required
def create_leave():
    data = request.get_json()
    query = """
        INSERT INTO leaves (employee_id, leave_type, from_date, to_date, reason)
        VALUES (%s, %s, %s, %s, %s)
    """
    params = (data['employee_id'], data['leave_type'], data['from_date'], data['to_date'], data.get('reason'))
    id = execute_insert(query, params)
    return success_response({'id': id}, "Created successfully", 201)

@leaves_bp.route('/<int:id>/approve', methods=['POST'])
@token_required
@require_role('ADMIN', 'HR')
def approve_leave(id):
    query = "UPDATE leaves SET status = 'approved', approved_by = %s WHERE id = %s"
    execute_update(query, (g.user['employee_id'], id))
    return success_response(None, "Leave approved")

@leaves_bp.route('/<int:id>/reject', methods=['POST'])
@token_required
@require_role('ADMIN', 'HR')
def reject_leave(id):
    query = "UPDATE leaves SET status = 'rejected', approved_by = %s WHERE id = %s"
    execute_update(query, (g.user['employee_id'], id))
    return success_response(None, "Leave rejected")
