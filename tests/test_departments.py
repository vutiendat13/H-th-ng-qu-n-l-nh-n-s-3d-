def test_departments_unauthorized(client):
    response = client.get('/api/departments')
    assert response.status_code == 401
