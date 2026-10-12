from app.database import get_db, execute_query

def test_database_connection(app):
    with app.app_context():
        db = get_db()
        assert db is not None
        
def test_tables_exist(app):
    with app.app_context():
        tables = execute_query("SHOW TABLES")
        table_names = [list(t.values())[0] for t in tables]
        
        expected_tables = ['users', 'roles', 'employees', 'departments', 'positions', 'permissions']
        for table in expected_tables:
            assert table in table_names
