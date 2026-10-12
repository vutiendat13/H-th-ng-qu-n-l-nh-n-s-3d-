from flask import Blueprint, request, g
from app.database import execute_query, execute_one, execute_insert, execute_update, execute_delete
from app.utils.response import success_response, error_response
from app.utils.validators import validate_required
from app.middleware.auth_middleware import token_required, require_role

roles_bp = Blueprint('roles', __name__)

@roles_bp.route('', methods=['GET'])
@token_required
def get_roles():
    data = execute_query("SELECT * FROM roles")
    return success_response(data)

@roles_bp.route('/permissions', methods=['GET'])
@token_required
def get_permissions():
    data = execute_query("SELECT * FROM permissions")
    return success_response(data)
