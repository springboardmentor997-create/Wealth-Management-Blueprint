"""
Test forgot password and reset password endpoints
"""
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# Step 1: Register a test user
print("=== Step 1: Register user ===")
reg = client.post('/auth/register', json={
    'name': 'Test User',
    'email': 'testforgot@example.com',
    'password': 'OldPass123!'
})
print(f"Register: {reg.status_code}")
print(reg.json())

# Step 2: Request forgot password
print("\n=== Step 2: Request forgot password ===")
forgot = client.post('/auth/forgot-password', json={
    'email': 'testforgot@example.com'
})
print(f"Forgot password: {forgot.status_code}")
data = forgot.json()
print(data)

# Extract reset token from response (for testing)
reset_token = data.get('reset_token')
print(f"Reset token: {reset_token}")

# Step 3: Try to login with old password (should fail)
print("\n=== Step 3: Try login with old password ===")
old_login = client.post('/auth/login', json={
    'email': 'testforgot@example.com',
    'password': 'OldPass123!'
})
print(f"Old login: {old_login.status_code}")
print(old_login.json())

# Step 4: Reset password
print("\n=== Step 4: Reset password ===")
reset = client.post('/auth/reset-password', json={
    'email': 'testforgot@example.com',
    'token': reset_token,
    'new_password': 'NewPass456!'
})
print(f"Reset password: {reset.status_code}")
print(reset.json())

# Step 5: Try to login with new password
print("\n=== Step 5: Login with new password ===")
new_login = client.post('/auth/login', json={
    'email': 'testforgot@example.com',
    'password': 'NewPass456!'
})
print(f"New login: {new_login.status_code}")
print(new_login.json())

print("\n=== Test Complete ===")
if new_login.status_code == 200:
    print("✅ Forgot password flow works!")
else:
    print("❌ Test failed")
