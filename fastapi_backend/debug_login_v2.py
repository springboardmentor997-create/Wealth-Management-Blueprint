import requests
import json
import sys

# Test configuration
BASE_URL = "http://localhost:8000"
TEST_EMAIL = "admin@wealth.com"
TEST_PASSWORD = "admin123"

def test_health():
    """Test if the server is running"""
    print("\n=== Testing Health Endpoint ===")
    try:
        response = requests.get(f"{BASE_URL}/docs", timeout=5)
        print(f"Status: {response.status_code}")
        return response.status_code == 200
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - Is the server running?")
        return False
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_login():
    """Test login endpoint with detailed debugging"""
    print("\n=== Testing Login Endpoint ===")
    
    login_data = {
        "username": TEST_EMAIL,  # OAuth2PasswordRequestForm expects username, not email
        "password": TEST_PASSWORD
    }
    
    # Also try JSON format expected by some custom endpoints
    login_json = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }

    try:
        # Attempt 1: Standard OAuth2 form data
        print(f"Attempting login at {BASE_URL}/api/auth/login (Form Data)...")
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            data=login_data,
            timeout=10
        )
        print(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Login successful (Form Data)!")
            print(f"Response: {response.json()}")
            return True
            
        # Attempt 2: JSON Body
        print(f"\nAttempting login at {BASE_URL}/api/auth/login (JSON)...")
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=login_json,
            timeout=10
        )
        print(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
             print("✅ Login successful (JSON)!")
             return True
        else:
             print(f"❌ Login failed with status {response.status_code}")
             print(f"Response: {response.text}")
             return False

    except requests.exceptions.ConnectionError:
        print("❌ Connection error")
        return False
    except Exception as e:
        print(f"❌ Login test failed: {e}")
        return False

if __name__ == "__main__":
    if test_health():
        test_login()
