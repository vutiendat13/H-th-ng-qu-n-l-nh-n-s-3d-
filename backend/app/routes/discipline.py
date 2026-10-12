from flask import Blueprint, request, g
from app.database import execute_query, execute_one, execute_insert, execute_update, execute_delete
from app.utils.response import success_response, error_response
from app.utils.validators import validate_required
from app.middleware.auth_middleware import token_required, require_role

discipline_bp = Blueprint('discipline', __name__)

@discipline_bp.route('', methods=['GET'])
@token_required
def get_discipline():
    employee_id = request.args.get('employee_id')
    query = "SELECT * FROM discipline WHERE employee_id = %s"
    data = execute_query(query, (employee_id,))
    return success_response(data)

@discipline_bp.route('', methods=['POST'])
@token_required
@require_role('ADMIN', 'HR')
def create_discipline():
    data = request.get_json()
    query = """
        INSERT INTO discipline (employee_id, form, discipline_date, reason, decision_number, notes)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    params = (data['employee_id'], data['form'], data['discipline_date'], data.get('reason'), data.get('decision_number'), data.get('notes'))
    id = execute_insert(query, params)
    return success_response({'id': id}, "Created successfully", 201)
