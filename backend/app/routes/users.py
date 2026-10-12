from flask import Blueprint, request, g
from app.database import execute_query, execute_one, execute_insert, execute_update, execute_delete
from app.utils.response import success_response, error_response
from app.utils.validators import validate_required
from app.middleware.auth_middleware import token_required

users_bp = Blueprint('users', __name__)

@users_bp.route('', methods=['GET'])
@token_required
def get_users():
    query = """
        SELECT u.id, u.username, u.employee_id, u.role_id, u.status, u.last_login, u.created_at,
               r.name as role_name, e.full_name as employee_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        LEFT JOIN employees e ON u.employee_id = e.id
    """
    users = execute_query(query)
    return success_response(users)
