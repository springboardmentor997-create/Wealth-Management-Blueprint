from fastapi.testclient import TestClient
from main import app
import time

client = TestClient(app)
print('TestClient ready')
# unique email
email = f'testclient+{int(time.time())}@example.com'
name = 'TCUser'
password = 'TestPass123!'
print('Registering', email)
resp = client.post('/auth/register', json={'name': name, 'email': email, 'password': password})
print('register status', resp.status_code, resp.text[:200])
if resp.status_code != 201:
    print('Register failed, response:', resp.text)
    raise SystemExit(1)

print('Logging in')
resp = client.post('/auth/login', json={'email': email, 'password': password})
print('login status', resp.status_code, resp.text[:200])
if resp.status_code != 200:
    print('Login failed', resp.text)
    raise SystemExit(1)
token = resp.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}
print('Calling dashboard summary')
resp = client.get('/dashboard/summary', headers=headers)
print('dashboard status', resp.status_code, resp.text[:400])

print('Creating a goal')
goal_payload = {'title':'Test Goal','description':'Testing','goal_type':'custom','target_amount':10000.00,'target_date':'2030-01-01','monthly_contribution':100.00}
resp = client.post('/goals/', json=goal_payload, headers=headers)
print('create goal status', resp.status_code, resp.text[:400])
if resp.status_code != 201:
    print('Create goal failed', resp.text)
    raise SystemExit(1)

goal = resp.json()
print('Created goal id', goal['id'])
print('Listing goals')
resp = client.get('/goals/', headers=headers)
print('list goals status', resp.status_code, resp.text[:400])

print('All tests passed')
