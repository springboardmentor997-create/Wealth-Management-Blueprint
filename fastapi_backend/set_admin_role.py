from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import User
import sys

def set_admin_role(email: str, is_admin: bool = True):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"User with email {email} not found.")
            return

        user.is_admin = "true" if is_admin else "false"
        db.commit()
        db.refresh(user)
        print(f"Successfully updated {user.email}: is_admin = {user.is_admin}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        email = sys.argv[1]
        set_admin_role(email)
    else:
        print("Usage: python set_admin_role.py <email>")
        print("Example: python set_admin_role.py dilip@example.com")
        
        # Interactive mode
        email = input("Enter the email of the user to promote to Admin: ").strip()
        if email:
            set_admin_role(email)
