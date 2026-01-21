from app.database import SessionLocal
from app.models import Admin
from app.auth import get_password_hash

# Create database session
db = SessionLocal()

try:
    # Check if admin already exists
    admin = db.query(Admin).first()
    
    if not admin:
        # Create default admin
        admin = Admin(
            username='admin',
            email='admin@example.com',
            password=get_password_hash('admin123')
        )
        db.add(admin)
        db.commit()
        print("✅ Admin user created successfully!")
        print("   Username: admin")
        print("   Password: admin123")
    else:
        print("✅ Admin user already exists")
        
except Exception as e:
    print(f"❌ Error creating admin: {e}")
    db.rollback()
finally:
    db.close()
