from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

email = 'smoke@example.com'
password = 'Passw0rd!'

# Try login
resp = client.post('/auth/login', json={'email': email, 'password': password})
if resp.status_code == 200:
    print('LOGIN_OK', resp.json())
else:
    print('LOGIN_FAILED', resp.status_code, resp.text)
    # register and login
    reg = client.post('/auth/register', json={'name': 'Smoke', 'email': email, 'password': password})
    print('REGISTER', reg.status_code, reg.text)
    resp = client.post('/auth/login', json={'email': email, 'password': password})
    print('LOGIN_AFTER_REGISTER', resp.status_code, resp.text)

if resp.status_code != 200:
    raise SystemExit('Unable to authenticate')

token = resp.json().get('access_token')
headers = {'Authorization': f'Bearer {token}'}

s = client.get('/dashboard/summary', headers=headers)
print('SUMMARY', s.status_code, s.json())
