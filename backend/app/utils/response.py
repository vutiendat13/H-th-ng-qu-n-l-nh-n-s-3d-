from flask import jsonify

def success_response(data=None, message='', status=200):
    response = {
        'success': True,
        'message': message,
        'data': data
    }
    return jsonify(response), status

def error_response(message, status=400, errors=None):
    response = {
        'success': False,
        'message': message
    }
    if errors:
        response['errors'] = errors
    return jsonify(response), status

def paginated_response(data, total, page, per_page):
    import math
    return jsonify({
        'success': True,
        'data': data,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total,
            'pages': math.ceil(total / per_page) if per_page > 0 else 0
        }
    })
