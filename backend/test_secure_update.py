import requests

BASE_URL = "http://localhost:8000"

def test_secure_update():
    # 1. Register/Login User A
    email_a = "userA@test.com"
    pass_a = "password123"
    try:
        requests.post(f"{BASE_URL}/auth/register", json={"name": "User A", "email": email_a, "password": pass_a})
    except:
        pass # Might already exist
        
    login_res = requests.post(f"{BASE_URL}/auth/login", json={"email": email_a, "password": pass_a})
    if login_res.status_code != 200:
        print("Login failed")
        return
        
    token_a = login_res.json()["access_token"]
    user_id_a = login_res.json()["user"]["id"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 2. Register/Login User B
    email_b = "userB@test.com"
    pass_b = "password123"
    try:
        requests.post(f"{BASE_URL}/auth/register", json={"name": "User B", "email": email_b, "password": pass_b})
    except:
        pass
        
    login_res_b = requests.post(f"{BASE_URL}/auth/login", json={"email": email_b, "password": pass_b})
    user_id_b = login_res_b.json()["user"]["id"]
    
    print(f"User A ID: {user_id_a}")
    print(f"User B ID: {user_id_b}")

    # 3. User A tries to update User A (Should Succeed)
    print("\nTest 1: User A updates User A...")
    res = requests.put(
        f"{BASE_URL}/users/{user_id_a}", 
        json={"name": "User A Updated"}, 
        headers=headers_a
    )
    if res.status_code == 200 and res.json()["name"] == "User A Updated":
        print("[OK] User A updated own profile.")
    else:
        print(f"[FAIL] Update failed: {res.status_code} {res.text}")

    # 4. User A tries to update User B (Should Fail 403)
    print("\nTest 2: User A updates User B...")
    res = requests.put(
        f"{BASE_URL}/users/{user_id_b}", 
        json={"name": "Hacked B"}, 
        headers=headers_a
    )
    if res.status_code == 403:
        print("[OK] Security check passed (403 Forbidden).")
    else:
        print(f"[FAIL] Security check failed! Status: {res.status_code}")

if __name__ == "__main__":
    test_secure_update()
