
from auth import create_access_token, verify_token, SECRET_KEY, ALGORITHM
from jose import jwt, JWTError
import datetime

def test_auth():
    print("Testing Auth Flow...")
    
    # 1. Create a dummy token
    data = {"sub": "test-user-id", "email": "test@example.com"}
    print(f"Creating token for data: {data}")
    
    token = create_access_token(data)
    print(f"Generated Token: {token}")
    
    # 2. Verify the token using verify_token function
    print("Verifying token with verify_token()...")
    result = verify_token(token)
    print(f"verify_token result: {result}")
    
    if result:
        print("SUCCESS: Token verified via function.")
    else:
        print("FAILURE: Token verification returned None.")

    # 3. Manual verification to debug
    print("\nManual Verification:")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"Decoded Payload: {payload}")
        print("SUCCESS: Manual decode worked.")
    except JWTError as e:
        print(f"FAILURE: Manual decode failed with error: {e}")
    except Exception as e:
        print(f"FAILURE: Unexpected error: {e}")

if __name__ == "__main__":
    test_auth()
