from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from app.database import init_app as init_db
from app.middleware.error_handlers import register_error_handlers
import os

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class())

    CORS(app)
    JWTManager(app)

    init_db(app)
    register_error_handlers(app)

    from app.routes.auth import auth_bp
    from app.routes.employees import employees_bp
    from app.routes.departments import departments_bp
    from app.routes.positions import positions_bp
    from app.routes.contracts import contracts_bp
    from app.routes.users import users_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.education import education_bp
    from app.routes.work_history import work_history_bp
    from app.routes.rewards import rewards_bp
    from app.routes.discipline import discipline_bp
    from app.routes.leaves import leaves_bp
    from app.routes.roles import roles_bp
    from app.routes.reports import reports_bp
    from app.routes.pages import pages_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(employees_bp, url_prefix='/api/employees')
    app.register_blueprint(departments_bp, url_prefix='/api/departments')
    app.register_blueprint(positions_bp, url_prefix='/api/positions')
    app.register_blueprint(contracts_bp, url_prefix='/api/contracts')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(education_bp, url_prefix='/api/education')
    app.register_blueprint(work_history_bp, url_prefix='/api/work-history')
    app.register_blueprint(rewards_bp, url_prefix='/api/rewards')
    app.register_blueprint(discipline_bp, url_prefix='/api/discipline')
    app.register_blueprint(leaves_bp, url_prefix='/api/leaves')
    app.register_blueprint(roles_bp, url_prefix='/api/roles')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(pages_bp)

    return app
