from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, User
from auth import get_password_hash
from datetime import datetime
import uuid

def create_admin_user():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if admin already exists
        admin = db.query(User).filter(User.email == "admin@wealth.com").first()
        if admin:
            print("Admin user already exists")
            return
        
        # Create admin user
        admin_password = "admin123"[:72]  # Truncate to 72 bytes for bcrypt
        admin_user = User(
            id=str(uuid.uuid4()),
            name="System Administrator",
            email="admin@wealth.com",
            password=get_password_hash(admin_password),
            risk_profile="moderate",
            kyc_status="verified",
            is_admin="true",
            created_at=datetime.utcnow()
        )
        
        db.add(admin_user)
        db.commit()
        print("Admin user created successfully!")
        print("Email: admin@wealth.com")
        print("Password: admin123")
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()