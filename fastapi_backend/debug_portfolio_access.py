import requests
import json
import sys

BASE_URL = "http://localhost:8000"
TEST_EMAIL = "admin@wealth.com"
TEST_PASSWORD = "admin123"

def debug_token_access():
    print("=== Debugging Token Access ===")
    
    # 1. Login
    print("\n1. Logging in...")
    try:
        login_resp = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if login_resp.status_code != 200:
            print(f"❌ Login failed: {login_resp.status_code} {login_resp.text}")
            return
        
        data = login_resp.json()
        token = data.get("token")
        if not token:
            print("❌ No token in response!")
            print(f"Response keys: {data.keys()}")
            return
            
        print(f"✅ Login success. Token: {token[:20]}...")
        
    except Exception as e:
        print(f"❌ Exception during login: {e}")
        return

    # 2. Access Protected Route (Portfolio)
    print("\n2. Accessing Protected Route (Portfolio History)...")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        port_resp = requests.get(
            f"{BASE_URL}/api/portfolio/history",
            headers=headers
        )
        
        print(f"Status Code: {port_resp.status_code}")
        if port_resp.status_code == 200:
            print("✅ Access Granted!")
            print(f"Data: {port_resp.json()}")
        else:
            print(f"❌ Access Denied: {port_resp.text}")
            
    except Exception as e:
        print(f"❌ Exception during access: {e}")

if __name__ == "__main__":
    debug_token_access()
