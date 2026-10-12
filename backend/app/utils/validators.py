import re
from datetime import datetime

def validate_required(data, fields):
    errors = []
    for field in fields:
        if field not in data or data[field] is None or str(data[field]).strip() == '':
            errors.append(f"Field '{field}' is required.")
    return errors

def validate_email(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None

def validate_date(date_str):
    try:
        datetime.strptime(date_str, '%Y-%m-%d')
        return True
    except ValueError:
        return False

def validate_phone(phone):
    # Basic phone validation, adjust as necessary for Vietnamese phone numbers
    pattern = r'^\+?[0-9]{9,15}$'
    return re.match(pattern, phone) is not None
