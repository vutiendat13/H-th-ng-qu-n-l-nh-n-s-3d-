from app.utils.response import error_response

def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(e):
        return error_response("Bad Request", 400)

    @app.errorhandler(401)
    def unauthorized(e):
        return error_response("Unauthorized", 401)

    @app.errorhandler(403)
    def forbidden(e):
        return error_response("Forbidden", 403)

    @app.errorhandler(404)
    def not_found(e):
        return error_response("Not Found", 404)

    @app.errorhandler(405)
    def method_not_allowed(e):
        return error_response("Method Not Allowed", 405)

    @app.errorhandler(500)
    def internal_server_error(e):
        return error_response("Internal Server Error", 500)
