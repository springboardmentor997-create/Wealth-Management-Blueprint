from fastapi.testclient import TestClient
from main import app
import time

client = TestClient(app)

# Helper to create user and return auth headers
def create_user_and_get_headers():
    email = f'testuser_rep+{int(time.time())}@example.com'
    name = 'RepTester'
    password = 'RepPass123!'
    resp = client.post('/auth/register', json={'name': name, 'email': email, 'password': password})
    assert resp.status_code == 201
    resp = client.post('/auth/login', json={'email': email, 'password': password})
    assert resp.status_code == 200
    token = resp.json()['access_token']
    return {'Authorization': f'Bearer {token}'}


def test_permission_and_validation_errors():
    # create user A and a goal
    headers_a = create_user_and_get_headers()
    goal_payload = {
        'goal_type': 'home',
        'target_amount': 50000.00,
        'target_date': '2030-01-01',
        'monthly_contribution': 500.00
    }
    r = client.post('/goals/', json=goal_payload, headers=headers_a)
    assert r.status_code == 201
    goal = r.json()
    goal_id = goal['id']

    # create user B
    headers_b = create_user_and_get_headers()

    # B should not be able to GET A's goal
    r = client.get(f'/goals/{goal_id}', headers=headers_b)
    assert r.status_code == 403

    # B should not be able to DELETE A's goal
    r = client.delete(f'/goals/{goal_id}', headers=headers_b)
    assert r.status_code == 403

    # Validation errors: invalid goal payload
    invalid_goal = {'goal_type': 'invalid_type', 'target_amount': 'not-a-number'}
    r = client.post('/goals/', json=invalid_goal, headers=headers_a)
    assert r.status_code == 422

    # Invalid investment payload (invalid enum for asset_type)
    invalid_inv = {'asset_type': 'invalid', 'symbol': 'X', 'units': 1}
    r = client.post('/portfolio/investments', json=invalid_inv, headers=headers_a)
    assert r.status_code == 422


def test_reports_exports_csv_and_pdf():
    headers = create_user_and_get_headers()

    # create an investment and a goal
    inv_payload = {
        'asset_type': 'stock',
        'symbol': 'MSFT',
        'units': 2.0,
        'avg_buy_price': 200.0,
        'cost_basis': 400.0,
        'current_value': 400.0,
        'last_price': 200.0
    }
    r = client.post('/portfolio/investments', json=inv_payload, headers=headers)
    assert r.status_code == 201

    goal_payload = {
        'goal_type': 'education',
        'target_amount': 20000.00,
        'target_date': '2028-06-01',
        'monthly_contribution': 200.00
    }
    r = client.post('/goals/', json=goal_payload, headers=headers)
    assert r.status_code == 201

    # CSV exports
    r = client.get('/reports/portfolio/export?format=csv', headers=headers)
    assert r.status_code == 200
    assert r.headers.get('content-type', '').startswith('text/csv')
    assert 'MSFT' in r.text

    r = client.get('/reports/goals/export?format=csv', headers=headers)
    assert r.status_code == 200
    assert r.headers.get('content-type', '').startswith('text/csv')
    assert 'education' in r.text

    # PDF exports (simple fallback) - check content-type and non-empty body
    r = client.get('/reports/portfolio/export?format=pdf', headers=headers)
    assert r.status_code == 200
    assert r.headers.get('content-type') == 'application/pdf'
    assert len(r.content) > 0

    r = client.get('/reports/goals/export?format=pdf', headers=headers)
    assert r.status_code == 200
    assert r.headers.get('content-type') == 'application/pdf'
    assert len(r.content) > 0
