import os
import uuid
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, User
from auth import get_password_hash

# Use a new database file
DATABASE_URL = "sqlite:///./wealth_app_new.db"

def init_database():
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Create admin user
        admin_id = str(uuid.uuid4())
        hashed_password = get_password_hash("admin123")
        
        admin_user = User(
            id=admin_id,
            name="Admin User",
            email="admin@wealthapp.com",
            password=hashed_password,
            risk_profile="moderate",
            kyc_status="verified",
            is_admin="true",
            login_count=0,
            created_at=datetime.utcnow().isoformat()
        )
        
        db.add(admin_user)
        db.commit()
        print("Admin user created successfully!")
        print("Email: admin@wealthapp.com")
        print("Password: admin123")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_database()