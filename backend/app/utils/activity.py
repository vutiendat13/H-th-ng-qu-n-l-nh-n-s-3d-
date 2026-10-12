from app.database import execute_insert
from flask import request

def log_activity(user_id, action, resource, resource_id=None, details=None, ip=None):
    if ip is None:
        ip = request.remote_addr
        
    query = """
        INSERT INTO activity_logs (user_id, action, resource, resource_id, details, ip_address)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    execute_insert(query, (user_id, action, resource, resource_id, details, ip))
