from flask import Blueprint, request, g
from app.database import execute_query, execute_one, execute_insert, execute_update, execute_delete
from app.utils.response import success_response, error_response
from app.utils.validators import validate_required
from app.utils.activity import log_activity
from app.middleware.auth_middleware import token_required, require_role

contracts_bp = Blueprint('contracts', __name__)

@contracts_bp.route('', methods=['GET'])
@token_required
def get_contracts():
    employee_id = request.args.get('employee_id')
    status = request.args.get('status')
    
    query = """
        SELECT c.*, e.full_name, e.code as employee_code
        FROM contracts c
        JOIN employees e ON c.employee_id = e.id
        WHERE 1=1
    """
    params = []
    
    if employee_id:
        query += " AND c.employee_id = %s"
        params.append(employee_id)
        
    if status:
        query += " AND c.status = %s"
        params.append(status)
        
    contracts = execute_query(query, tuple(params))
    return success_response(contracts)
