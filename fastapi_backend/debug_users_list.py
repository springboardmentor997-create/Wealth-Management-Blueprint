from sqlalchemy.orm import Session
from database import SessionLocal
from models import User

def list_users():
    db = SessionLocal()
    users = db.query(User).all()
    print(f"{'Email':<30} | {'Is Admin':<10} | {'KYC Status'}")
    print("-" * 60)
    for u in users:
        print(f"{u.email:<30} | {str(u.is_admin):<10} | {u.kyc_status}")
    db.close()

if __name__ == "__main__":
    list_users()
