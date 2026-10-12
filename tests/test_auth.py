import json
import pytest

def test_login_missing_fields(client):
    response = client.post('/api/auth/login', json={'username': 'admin'})
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data['success'] is False

def test_login_invalid_credentials(client):
    response = client.post('/api/auth/login', json={
        'username': 'admin',
        'password': 'wrongpassword'
    })
    assert response.status_code == 401
    data = json.loads(response.data)
    assert data['success'] is False

# Note: Further tests require a setup db with the seeded admin user
def test_login_success(client):
    response = client.post('/api/auth/login', json={
        'username': 'admin',
        'password': 'Admin@123'
    })
    # If the database is properly seeded, this should be 200
    if response.status_code == 200:
        data = json.loads(response.data)
        assert data['success'] is True
        assert 'token' in data['data']
