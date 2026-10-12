from flask import Blueprint, request, g
from app.database import execute_query, execute_one, execute_insert, execute_update, execute_delete
from app.utils.response import success_response, error_response
from app.utils.validators import validate_required
from app.middleware.auth_middleware import token_required, require_role

work_history_bp = Blueprint('work_history', __name__)

@work_history_bp.route('', methods=['GET'])
@token_required
def get_work_history():
    employee_id = request.args.get('employee_id')
    query = """
        SELECT wh.*, d.name as department_name, p.name as position_name
        FROM work_history wh
        LEFT JOIN departments d ON wh.department_id = d.id
        LEFT JOIN positions p ON wh.position_id = p.id
        WHERE wh.employee_id = %s
    """
    data = execute_query(query, (employee_id,))
    return success_response(data)

@work_history_bp.route('', methods=['POST'])
@token_required
@require_role('ADMIN', 'HR')
def create_work_history():
    data = request.get_json()
    query = """
        INSERT INTO work_history (employee_id, department_id, position_id, start_date, end_date, decision_number, notes)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    params = (data['employee_id'], data['department_id'], data['position_id'], data['start_date'], data.get('end_date'), data.get('decision_number'), data.get('notes'))
    id = execute_insert(query, params)
    return success_response({'id': id}, "Created successfully", 201)
