from flask import Blueprint, request, g
import bcrypt
from flask_jwt_extended import create_access_token
from app.database import execute_one, execute_update, execute_query
from app.utils.response import success_response, error_response
from app.utils.validators import validate_required
from app.utils.activity import log_activity
from app.middleware.auth_middleware import token_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    errors = validate_required(data, ['username', 'password'])
    if errors:
        return error_response("Validation error", 400, errors)

    user = execute_one("SELECT * FROM users WHERE username = %s", (data['username'],))
    if not user:
        return error_response("Invalid username or password", 401)

    if user['status'] != 'active':
        return error_response("Account is inactive", 403)

    if not bcrypt.checkpw(data['password'].encode('utf-8'), user['password_hash'].encode('utf-8')):
        return error_response("Invalid username or password", 401)

    # Update last login
    execute_update("UPDATE users SET last_login = NOW() WHERE id = %s", (user['id'],))
    
    role = execute_one("SELECT name FROM roles WHERE id = %s", (user['role_id'],))
    
    identity = {
        'id': user['id'],
        'username': user['username'],
        'role': role['name'] if role else None,
        'employee_id': user['employee_id']
    }
    
    token = create_access_token(identity=identity)
    
    log_activity(user['id'], 'login', 'auth', user['id'], 'User logged in')
    
    return success_response({
        'token': token,
        'user': identity
    }, "Login successful")

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_me():
    user = execute_one("""
        SELECT u.id, u.username, u.employee_id, u.status, r.name as role_name 
        FROM users u 
        JOIN roles r ON u.role_id = r.id 
        WHERE u.id = %s
    """, (g.user['id'],))
    
    permissions = execute_query("""
        SELECT p.resource, p.action 
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = %s
    """, (g.user['role_id'],))
    
    user['permissions'] = permissions
    return success_response(user)

@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout():
    log_activity(g.user['id'], 'logout', 'auth', g.user['id'], 'User logged out')
    return success_response(None, "Logged out successfully")

@auth_bp.route('/change-password', methods=['POST'])
@token_required
def change_password():
    data = request.get_json()
    errors = validate_required(data, ['current_password', 'new_password'])
    if errors:
        return error_response("Validation error", 400, errors)

    user = execute_one("SELECT password_hash FROM users WHERE id = %s", (g.user['id'],))
    if not bcrypt.checkpw(data['current_password'].encode('utf-8'), user['password_hash'].encode('utf-8')):
        return error_response("Invalid current password", 400)

    new_hash = bcrypt.hashpw(data['new_password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    execute_update("UPDATE users SET password_hash = %s WHERE id = %s", (new_hash, g.user['id']))
    
    log_activity(g.user['id'], 'change_password', 'users', g.user['id'], 'Password changed')
    
    return success_response(None, "Password changed successfully")
