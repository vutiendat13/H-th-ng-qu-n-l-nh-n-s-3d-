from flask import Blueprint, send_from_directory, redirect
import os

pages_bp = Blueprint('pages', __name__)
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'frontend'))
PAGES_DIR = os.path.join(FRONTEND_DIR, 'pages')


@pages_bp.route('/')
def index():
    return redirect('/login')


@pages_bp.route('/login')
def login_page():
    return send_from_directory(PAGES_DIR, 'login.html')


@pages_bp.route('/dashboard')
def dashboard_page():
    return send_from_directory(PAGES_DIR, 'dashboard.html')


@pages_bp.route('/employees')
def employees_page():
    return send_from_directory(PAGES_DIR, 'employees.html')


@pages_bp.route('/employee-detail')
def employee_detail_page():
    return send_from_directory(PAGES_DIR, 'employee-detail.html')


@pages_bp.route('/employee-form')
def employee_form_page():
    return send_from_directory(PAGES_DIR, 'employee-form.html')


@pages_bp.route('/departments')
def departments_page():
    return send_from_directory(PAGES_DIR, 'departments.html')


@pages_bp.route('/positions')
def positions_page():
    return send_from_directory(PAGES_DIR, 'positions.html')


@pages_bp.route('/education')
def education_page():
    return send_from_directory(PAGES_DIR, 'education.html')


@pages_bp.route('/contracts')
def contracts_page():
    return send_from_directory(PAGES_DIR, 'contracts.html')


@pages_bp.route('/work-history')
def work_history_page():
    return send_from_directory(PAGES_DIR, 'work-history.html')


@pages_bp.route('/rewards')
def rewards_page():
    return send_from_directory(PAGES_DIR, 'rewards.html')


@pages_bp.route('/discipline')
def discipline_page():
    return send_from_directory(PAGES_DIR, 'discipline.html')


@pages_bp.route('/leaves')
def leaves_page():
    return send_from_directory(PAGES_DIR, 'leaves.html')


@pages_bp.route('/users')
def users_page():
    return send_from_directory(PAGES_DIR, 'users.html')


@pages_bp.route('/roles')
def roles_page():
    return send_from_directory(PAGES_DIR, 'roles.html')


@pages_bp.route('/reports')
def reports_page():
    return send_from_directory(PAGES_DIR, 'reports.html')


@pages_bp.route('/settings')
def settings_page():
    return send_from_directory(PAGES_DIR, 'settings.html')


# Serve all static frontend files (CSS, JS, assets, three/)
@pages_bp.route('/frontend/<path:path>')
def frontend_static(path):
    return send_from_directory(FRONTEND_DIR, path)
