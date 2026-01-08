import requests
import json

# Test the backend
BASE_URL = "http://localhost:8000"

def test_backend():
    # Test health endpoint
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Health check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"Health check failed: {e}")
        return False
    
    # Test login
    try:
        login_data = {
            "email": "admin@wealthapp.com",
            "password": "admin123"
        }
        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        print(f"Login test: {response.status_code}")
        if response.status_code == 200:
            print("Login successful!")
            return True
        else:
            print(f"Login failed: {response.text}")
            return False
    except Exception as e:
        print(f"Login test failed: {e}")
        return False

if __name__ == "__main__":
    test_backend()