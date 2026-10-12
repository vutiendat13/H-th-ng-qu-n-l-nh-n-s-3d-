def test_get_employees_unauthorized(client):
    response = client.get('/api/employees')
    assert response.status_code == 401

# Note: Complete testing requires obtaining a valid token first
