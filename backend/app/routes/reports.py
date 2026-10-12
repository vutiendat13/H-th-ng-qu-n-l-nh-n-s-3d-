from flask import Blueprint, request, g
from app.database import execute_query, execute_one, execute_insert, execute_update, execute_delete
from app.utils.response import success_response, error_response
from app.utils.validators import validate_required
from app.middleware.auth_middleware import token_required, require_role

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/employees', methods=['GET'])
@token_required
def get_employees_report():
    query = """
        SELECT e.*, d.name as department_name, p.name as position_name 
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN positions p ON e.position_id = p.id
    """
    data = execute_query(query)
    return success_response(data)
