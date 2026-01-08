from sqlalchemy import create_engine
from models import Base, User
from database import DATABASE_URL
from auth import get_password_hash
from datetime import datetime
import hashlib

def init_database():
    # Create engine and tables
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    
    from database import SessionLocal
    db = SessionLocal()
    
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.email == "admin@wealth.com").first()
        if admin:
            print("Admin user already exists")
            return
        
        # Create admin with simple hash
        password_hash = hashlib.sha256("admin123".encode()).hexdigest()
        
        admin_user = User(
            name="System Administrator",
            email="admin@wealth.com",
            password=password_hash,
            risk_profile="moderate",
            kyc_status="verified",
            is_admin="true",
            login_count=0,
            created_at=datetime.utcnow()
        )
        
        db.add(admin_user)
        db.commit()
        print("Database initialized and admin user created!")
        print("Email: admin@wealth.com")
        print("Password: admin123")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_database()