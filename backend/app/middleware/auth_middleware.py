from functools import wraps
from flask import g
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.utils.response import error_response
from app.database import execute_one, execute_query

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        verify_jwt_in_request()
        identity = get_jwt_identity()
        user_id = identity.get('id')
        
        user = execute_one("SELECT * FROM users WHERE id = %s", (user_id,))
        if not user or user['status'] != 'active':
            return error_response("Invalid or inactive user", 401)
            
        role = execute_one("SELECT * FROM roles WHERE id = %s", (user['role_id'],))
        
        g.user = user
        g.role = role['name'] if role else None
        
        return f(*args, **kwargs)
    return decorated

def require_role(*roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not g.user:
                return error_response("Unauthorized", 401)
            
            if g.role not in roles and 'ADMIN' not in roles and g.role != 'ADMIN':
                return error_response("Insufficient permissions", 403)
                
            return f(*args, **kwargs)
        return decorated
    return decorator

def require_permission(resource, action):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not g.user:
                return error_response("Unauthorized", 401)
                
            if g.role == 'ADMIN':
                return f(*args, **kwargs)
                
            query = """
                SELECT p.id FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                WHERE rp.role_id = %s AND p.resource = %s AND p.action = %s
            """
            perm = execute_one(query, (g.user['role_id'], resource, action))
            
            if not perm:
                return error_response(f"Missing permission: {action} on {resource}", 403)
                
            return f(*args, **kwargs)
        return decorated
    return decorator
