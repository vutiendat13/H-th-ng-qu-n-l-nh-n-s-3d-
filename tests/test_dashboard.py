def test_dashboard_summary_unauthorized(client):
    response = client.get('/api/dashboard/summary')
    assert response.status_code == 401
