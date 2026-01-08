from database import SessionLocal
from models import User
import json

def list_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Found {len(users)} users:")
        results = []
        for user in users:
            results.append({
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "kyc_status": user.kyc_status,
                "credits": user.credits,
                "last_login": str(user.last_login) if user.last_login else None
            })
        print(json.dumps(results, indent=2))
    finally:
        db.close()

if __name__ == "__main__":
    list_users()
