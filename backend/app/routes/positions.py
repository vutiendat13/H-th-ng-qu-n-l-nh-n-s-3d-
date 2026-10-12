from flask import Blueprint, request, g
from app.database import execute_query, execute_one, execute_insert, execute_update, execute_delete
from app.utils.response import success_response, error_response, paginated_response
from app.utils.pagination import get_pagination_params
from app.utils.validators import validate_required
from app.utils.activity import log_activity
from app.middleware.auth_middleware import token_required, require_role, require_permission

positions_bp = Blueprint('positions', __name__)

@positions_bp.route('', methods=['GET'])
@token_required
def get_positions():
    page, per_page, offset = get_pagination_params(request)
    search = request.args.get('search', '')
    
    base_query = "FROM positions WHERE 1=1"
    params = []
    
    if search:
        base_query += " AND (name LIKE %s OR code LIKE %s)"
        params.extend([f"%{search}%"] * 2)
        
    total_query = f"SELECT COUNT(*) as total {base_query}"
    total = execute_one(total_query, tuple(params))['total']
    
    data_query = f"""
        SELECT p.*,
        (SELECT COUNT(*) FROM employees WHERE position_id = p.id AND status = 'active') as employee_count
        {base_query}
        ORDER BY level, id
        LIMIT %s OFFSET %s
    """
    params.extend([per_page, offset])
    positions = execute_query(data_query, tuple(params))
    
    return paginated_response(positions, total, page, per_page)
