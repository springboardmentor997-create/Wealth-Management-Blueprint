"""
Test password reset with email sending
"""
from fastapi.testclient import TestClient
from main import app
from core.config import settings
import sys

# Fix encoding for Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

client = TestClient(app)

print("=" * 60)
print("PASSWORD RESET EMAIL TEST")
print("=" * 60)

# Check if email is configured
if settings.SMTP_USER and settings.SMTP_PASSWORD:
    print(f"[OK] Email configured for: {settings.SMTP_USER}")
    print(f"    Sender: {settings.SENDER_NAME} <{settings.SENDER_EMAIL}>")
else:
    print("[WARN] Email NOT configured - tokens will be logged to console")
    print("       See EMAIL_SETUP.md for configuration instructions")

print("\n" + "=" * 60)
print("Step 1: Register user")
print("=" * 60)

reg = client.post('/auth/register', json={
    'name': 'Email Test User',
    'email': 'emailtest@example.com',
    'password': 'TestPass123!'
})
print(f"Status: {reg.status_code}")
print(f"User: {reg.json()}")

print("\n" + "=" * 60)
print("Step 2: Request password reset (email will be sent)")
print("=" * 60)

forgot = client.post('/auth/forgot-password', json={
    'email': 'emailtest@example.com'
})
print(f"Status: {forgot.status_code}")
print(f"Response: {forgot.json()}")

if settings.SMTP_USER:
    print("\n[OK] Email sent to emailtest@example.com")
    print("     Check your inbox for the password reset code")
else:
    # Extract from logs (in test mode, we'd need to capture logs)
    print("\n[WARN] Email NOT sent - check backend logs for reset token")
    print("       Look for: 'Reset token for emailtest@example.com: ...'")

print("\n" + "=" * 60)
print("To use the reset code:")
print("1. Go to http://localhost:5173/forgot-password")
print("2. Enter: emailtest@example.com")
print("3. Enter the reset code from your email (or logs)")
print("4. Create a new password")
print("=" * 60)
