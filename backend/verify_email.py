from core.config import settings
from services.email_service import send_password_reset_email
import sys
import os
from dotenv import load_dotenv

# Force reload .env to get latest changes
load_dotenv(override=True)

def verify_email_config():
    print("--- Email Configuration Verification ---")
    print(f"SMTP Server: {settings.SMTP_SERVER}:{settings.SMTP_PORT}")
    print(f"SMTP User:   {settings.SMTP_USER}")
    # Mask password for security
    masked_pw = settings.SMTP_PASSWORD[:2] + "*" * (len(settings.SMTP_PASSWORD)-2) if settings.SMTP_PASSWORD else "NOT_SET"
    print(f"SMTP Pass:   {masked_pw}")
    
    if "your_email" in settings.SMTP_USER or not settings.SMTP_USER:
        print("\n[!] FAIL: Still seeing placeholder email.")
        return

    if "your_app" in settings.SMTP_PASSWORD or not settings.SMTP_PASSWORD:
         print("\n[!] FAIL: Still seeing placeholder password.")
         return

    print("\nAttempting to send test email to sender address...")
    try:
        success = send_password_reset_email(settings.SENDER_EMAIL, "TEST-VERIFICATION", "Admin")
        if success:
            print("\n[SUCCESS] Test email sent successfully! Check your inbox.")
        else:
            print("\n[FAILURE] Email service returned False. Check logs.")
    except Exception as e:
        print(f"\n[EXCEPTION] {e}")

if __name__ == "__main__":
    sys.path.append('.')
    verify_email_config()
