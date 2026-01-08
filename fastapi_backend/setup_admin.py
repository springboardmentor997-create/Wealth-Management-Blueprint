from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, User
from datetime import datetime
import hashlib

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
        
        # Simple hash for admin password (for demo purposes)
        simple_hash = hashlib.sha256("admin123".encode()).hexdigest()
        
        # Create admin user
        admin_user = User(
            name="System Administrator",
            email="admin@wealth.com",
            password=simple_hash,  # Using simple hash temporarily
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
        print("Note: Using simple hash - update to bcrypt in production")
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()