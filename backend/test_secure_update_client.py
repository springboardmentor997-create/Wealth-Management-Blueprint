from fastapi.testclient import TestClient
from main import app
from core.security import create_access_token
from models.user import User
from sqlmodel import Session, select
from core.database import get_session

# Override dependency if needed? 
# For this simple test, we might rely on the dev DB if accessible, 
# or mock the session. But let's try with the real app/db first if it's simpler.
# If DB connection fails, I'll need to mock.

client = TestClient(app)

def test_secure_update_mock():
    print("Testing Secure Update logic...")
    
    # 1. Login/Create User A
    # Since we can't easily reset DB, let's create random users
    import secrets
    rnd = secrets.token_hex(4)
    email_a = f"userA_{rnd}@test.com"
    pass_a = "pass"
    
    client.post("/auth/register", json={"name": "User A", "email": email_a, "password": pass_a})
    login_a = client.post("/auth/login", json={"email": email_a, "password": pass_a})
    token_a = login_a.json()["access_token"]
    user_id_a = login_a.json()["user"]["id"]
    headers_a = {"Authorization": f"Bearer {token_a}"}
    
    # 2. Login/Create User B
    email_b = f"userB_{rnd}@test.com"
    client.post("/auth/register", json={"name": "User B", "email": email_b, "password": pass_a})
    login_b = client.post("/auth/login", json={"email": email_b, "password": pass_a})
    user_id_b = login_b.json()["user"]["id"]
    
    print(f"User A: {user_id_a}, User B: {user_id_b}")

    # 3. A updates A -> 200
    res = client.put(f"/users/{user_id_a}", json={"name": "Updated A"}, headers=headers_a)
    if res.status_code == 200:
        print("[OK] User A updated own profile")
    else:
        print(f"[FAIL] User A own update failed: {res.status_code} {res.text}")

    # 4. A updates B -> 403
    res = client.put(f"/users/{user_id_b}", json={"name": "Hacked B"}, headers=headers_a)
    if res.status_code == 403:
        print("[OK] User A cannot update User B (403 Forbidden)")
    else:
        print(f"[FAIL] User A updated User B! Status: {res.status_code}")

if __name__ == "__main__":
    test_secure_update_mock()
