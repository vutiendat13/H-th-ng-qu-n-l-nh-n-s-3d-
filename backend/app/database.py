import pymysql
from contextlib import contextmanager
from flask import g, current_app

def get_db():
    if 'db' not in g:
        g.db = pymysql.connect(**current_app.config['DB_CONFIG'])
    return g.db

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_app(app):
    app.teardown_appcontext(close_db)

@contextmanager
def get_cursor():
    db = get_db()
    cursor = db.cursor(pymysql.cursors.DictCursor)
    try:
        yield cursor
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        cursor.close()

def execute_query(query, params=None):
    with get_cursor() as cursor:
        cursor.execute(query, params)
        return cursor.fetchall()

def execute_one(query, params=None):
    with get_cursor() as cursor:
        cursor.execute(query, params)
        return cursor.fetchone()

def execute_insert(query, params=None):
    with get_cursor() as cursor:
        cursor.execute(query, params)
        return cursor.lastrowid

def execute_update(query, params=None):
    with get_cursor() as cursor:
        cursor.execute(query, params)
        return cursor.rowcount

def execute_delete(query, params=None):
    with get_cursor() as cursor:
        cursor.execute(query, params)
        return cursor.rowcount
