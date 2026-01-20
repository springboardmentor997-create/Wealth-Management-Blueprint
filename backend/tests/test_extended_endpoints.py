from fastapi.testclient import TestClient
from main import app
import time

client = TestClient(app)

# Helper to create user and return auth headers
def create_user_and_get_headers():
    email = f'testuser_ext+{int(time.time())}@example.com'
    name = 'ExtTester'
    password = 'ExtPass123!'
    resp = client.post('/auth/register', json={'name': name, 'email': email, 'password': password})
    assert resp.status_code == 201
    resp = client.post('/auth/login', json={'email': email, 'password': password})
    assert resp.status_code == 200
    token = resp.json()['access_token']
    return {'Authorization': f'Bearer {token}'}


def test_portfolio_investments_and_transactions_crud():
    headers = create_user_and_get_headers()

    # Create investment
    inv_payload = {
        'asset_type': 'stock',
        'symbol': 'AAPL',
        'units': 10.0,
        'avg_buy_price': 150.00,
        'cost_basis': 1500.00,
        'current_value': 1500.00
    }
    # include last_price to satisfy DB NOT NULL constraint
    inv_payload['last_price'] = 150.00
    r = client.post('/portfolio/investments', json=inv_payload, headers=headers)
    assert r.status_code == 201
    inv = r.json()
    inv_id = inv['id']

    # Get investments list
    r = client.get('/portfolio/investments', headers=headers)
    assert r.status_code == 200
    assert any(i['id'] == inv_id for i in r.json())

    # Create transaction (buy) — provide symbol and type per API schema
    tx_payload = {
        'symbol': 'AAPL',
        'type': 'buy',
        'quantity': 5.0,
        'price': 155.00,
        'fees': 1.00
    }
    r = client.post('/portfolio/transactions', json=tx_payload, headers=headers)
    assert r.status_code == 201
    tx = r.json()
    tx_id = tx['id']

    # Get transactions list
    r = client.get('/portfolio/transactions', headers=headers)
    assert r.status_code == 200
    assert any(t['id'] == tx_id for t in r.json())

    # Delete transaction
    r = client.delete(f'/portfolio/transactions/{tx_id}', headers=headers)
    assert r.status_code == 204

    # Delete investment
    r = client.delete(f'/portfolio/investments/{inv_id}', headers=headers)
    assert r.status_code == 204


def test_simulations_crud():
    headers = create_user_and_get_headers()

    sim_payload = {
        'scenario_name': 'Test Sim',
        'assumptions': {'start_value': 10000, 'annual_return': 0.06},
        'goal_id': None
    }
    r = client.post('/simulations/', json=sim_payload, headers=headers)
    assert r.status_code == 201
    sim = r.json()
    sim_id = sim['id']

    r = client.get('/simulations/', headers=headers)
    assert r.status_code == 200
    assert any(s['id'] == sim_id for s in r.json())

    r = client.get(f'/simulations/{sim_id}', headers=headers)
    assert r.status_code == 200

    r = client.delete(f'/simulations/{sim_id}', headers=headers)
    assert r.status_code == 204


def test_recommendations_crud():
    headers = create_user_and_get_headers()

    rec_payload = {
        'title': 'Test Rec',
        'recommendation_text': 'Allocate to index funds',
        'suggested_allocation': {'stocks': 0.7, 'bonds': 0.3},
        'priority': 5
    }
    r = client.post('/recommendations/', json=rec_payload, headers=headers)
    assert r.status_code == 201
    rec = r.json()
    rec_id = rec['id']

    r = client.get('/recommendations/', headers=headers)
    assert r.status_code == 200
    assert any(item['id'] == rec_id for item in r.json())

    # Update recommendation
    # API requires full RecommendationCreate shape for PUT; include unchanged fields
    import json
    sa = rec.get('suggested_allocation', {})
    if isinstance(sa, str):
        try:
            sa = json.loads(sa)
        except Exception:
            sa = {}

    update_payload = {
        'title': rec['title'],
        'recommendation_text': rec['recommendation_text'],
        'suggested_allocation': sa,
        'status': rec.get('status', 'pending'),
        'priority': 10
    }
    r = client.put(f'/recommendations/{rec_id}', json=update_payload, headers=headers)
    assert r.status_code == 200
    assert r.json()['priority'] == 10

    r = client.delete(f'/recommendations/{rec_id}', headers=headers)
    assert r.status_code == 204
