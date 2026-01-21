#!/usr/bin/env python3
"""
Database Setup Script for Wealth Management System
Run this script to create the database and admin user
"""

import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.database import SQLALCHEMY_DATABASE_URL
from app.models import Base, Admin
from app.auth import get_password_hash

def setup_database():
    """Create database tables and default admin user"""
    print("🔧 Setting up Wealth Management Database...")
    
    try:
        # Create engine
        engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=False)
        
        # Create all tables
        print("📊 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        
        # Create session
        SessionLocal = sessionmaker(bind=engine)
        db = SessionLocal()
        
        try:
            # Check if admin already exists
            existing_admin = db.query(Admin).filter(Admin.username == "admin").first()
            if existing_admin:
                print("ℹ️  Admin user already exists")
            else:
                # Create default admin
                print("👤 Creating default admin user...")
                default_admin = Admin(
                    username="admin",
                    email="admin@wealthmanagement.com",
                    password=get_password_hash("admin123")
                )
                db.add(default_admin)
                db.commit()
                print("✅ Default admin created successfully!")
                print("   Username: admin")
                print("   Password: admin123")
        
        except Exception as e:
            print(f"❌ Error creating admin user: {e}")
            db.rollback()
            raise
        finally:
            db.close()
            
        print("\n🎉 Database setup completed successfully!")
        print("You can now run the application with: python run.py")
        
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Make sure MySQL is running")
        print("2. Check your .env file configuration")
        print("3. Ensure database 'wealth_management_db' exists")
        print("4. Verify MySQL user permissions")
        sys.exit(1)

if __name__ == "__main__":
    setup_database()
