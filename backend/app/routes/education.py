from flask import Blueprint, request, g
from app.database import execute_query, execute_one, execute_insert, execute_update, execute_delete
from app.utils.response import success_response, error_response
from app.utils.validators import validate_required
from app.middleware.auth_middleware import token_required, require_role

education_bp = Blueprint('education', __name__)

@education_bp.route('', methods=['GET'])
@token_required
def get_education():
    employee_id = request.args.get('employee_id')
    query = "SELECT * FROM education WHERE employee_id = %s"
    data = execute_query(query, (employee_id,))
    return success_response(data)

@education_bp.route('/<int:id>', methods=['GET'])
@token_required
def get_education_detail(id):
    data = execute_one("SELECT * FROM education WHERE id = %s", (id,))
    if not data:
        return error_response("Not found", 404)
    return success_response(data)

@education_bp.route('', methods=['POST'])
@token_required
@require_role('ADMIN', 'HR')
def create_education():
    data = request.get_json()
    query = """
        INSERT INTO education (employee_id, degree, major, institution, graduation_year, is_main)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    params = (data['employee_id'], data['degree'], data.get('major'), data.get('institution'), data.get('graduation_year'), data.get('is_main', 0))
    id = execute_insert(query, params)
    return success_response({'id': id}, "Created successfully", 201)
