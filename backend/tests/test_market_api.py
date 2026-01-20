"""Tests for market API integration with Alpha Vantage and Indian Stock API"""
from fastapi.testclient import TestClient
from main import app
import time

client = TestClient(app)


def create_test_user_and_get_headers():
    """Helper to create a test user and return auth headers"""
    email = f'testmarket+{int(time.time())}@example.com'
    name = 'MarketTester'
    password = 'MarketPass123!'
    
    resp = client.post('/auth/register', json={'name': name, 'email': email, 'password': password})
    assert resp.status_code == 201
    
    resp = client.post('/auth/login', json={'email': email, 'password': password})
    assert resp.status_code == 200
    token = resp.json()['access_token']
    return {'Authorization': f'Bearer {token}'}


def test_market_search():
    """Test searching for stocks in both global and Indian markets"""
    headers = create_test_user_and_get_headers()
    
    # Search for a stock
    r = client.get('/market/search?q=AAPL', headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert 'query' in data
    assert data['query'] == 'AAPL'
    assert 'global' in data or 'india' in data


def test_get_stock_global():
    """Test getting global stock data"""
    headers = create_test_user_and_get_headers()
    
    r = client.get('/market/stock/AAPL', headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert 'symbol' in data
    # Data might be from global or indian market, or might have error
    assert data.get('symbol') == 'AAPL' or 'error' in data


def test_global_quote():
    """Test getting global stock quote from Alpha Vantage"""
    headers = create_test_user_and_get_headers()
    
    r = client.get('/market/global/quote/MSFT', headers=headers)
    assert r.status_code == 200
    data = r.json()
    # Either has data or has error (depending on API rate limits)
    assert 'symbol' in data or 'error' in data


def test_india_search():
    """Test searching for Indian stocks"""
    headers = create_test_user_and_get_headers()
    
    r = client.get('/market/india/search?q=TCS', headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert 'market' in data
    assert data['market'] == 'INDIA'
    assert 'results' in data or 'query' in data


def test_india_stock():
    """Test getting Indian stock data"""
    headers = create_test_user_and_get_headers()
    
    r = client.get('/market/india/stock/TCS', headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert 'market' in data
    assert data['market'] == 'INDIA'
    assert 'symbol' in data


def test_india_multiple_stocks():
    """Test getting multiple Indian stocks"""
    headers = create_test_user_and_get_headers()
    
    r = client.get('/market/india/stocks?symbols=TCS,INFY,RELIANCE', headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert 'market' in data
    assert data['market'] == 'INDIA'
    assert 'symbols' in data


def test_recommendation():
    """Test generating investment recommendation"""
    headers = create_test_user_and_get_headers()
    
    r = client.get('/market/recommend/AAPL', headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert 'symbol' in data
    assert 'recommendation' in data
    assert 'suggested_allocation' in data
    assert 'stocks' in data['suggested_allocation']


def test_unauthenticated_market_access():
    """Test that unauthenticated users cannot access market endpoints"""
    r = client.get('/market/search?q=AAPL')
    assert r.status_code == 401
    
    r = client.get('/market/stock/AAPL')
    assert r.status_code == 401
    
    r = client.get('/market/global/quote/MSFT')
    assert r.status_code == 401


def test_india_format_parameter():
    """Test that format parameter is validated"""
    headers = create_test_user_and_get_headers()
    
    # Valid formats
    r = client.get('/market/india/stock/TCS?res_type=num', headers=headers)
    assert r.status_code == 200
    
    r = client.get('/market/india/stock/TCS?res_type=csv', headers=headers)
    assert r.status_code == 200
    
    # Invalid format should fail validation
    r = client.get('/market/india/stock/TCS?res_type=invalid', headers=headers)
    assert r.status_code == 422
