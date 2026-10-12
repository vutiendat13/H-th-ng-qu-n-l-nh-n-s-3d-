from flask import Blueprint, request, g
from app.database import execute_query, execute_one, execute_insert, execute_update, execute_delete
from app.utils.response import success_response, error_response
from app.utils.validators import validate_required
from app.middleware.auth_middleware import token_required, require_role

rewards_bp = Blueprint('rewards', __name__)

@rewards_bp.route('', methods=['GET'])
@token_required
def get_rewards():
    employee_id = request.args.get('employee_id')
    query = "SELECT * FROM rewards WHERE employee_id = %s"
    data = execute_query(query, (employee_id,))
    return success_response(data)

@rewards_bp.route('', methods=['POST'])
@token_required
@require_role('ADMIN', 'HR')
def create_reward():
    data = request.get_json()
    query = """
        INSERT INTO rewards (employee_id, reward_type, award_date, content, decision_number, notes)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    params = (data['employee_id'], data['reward_type'], data['award_date'], data.get('content'), data.get('decision_number'), data.get('notes'))
    id = execute_insert(query, params)
    return success_response({'id': id}, "Created successfully", 201)
