#!/usr/bin/env python3
"""
Create admin user for deployed database (works with any DATABASE_URL)
This script reads the same DATABASE_URL that your deployed app uses.
"""

import os
import sys
import hashlib
import uuid
from datetime import datetime
from pathlib import Path

# Add the parent directory to the path so we can import from fastapi_backend
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from dotenv import load_dotenv

def create_admin_user():
    # Load environment variables (same as main app)
    env_path = Path(__file__).parent.parent / '.env'
    load_dotenv(dotenv_path=env_path)
    
    # Get DATABASE_URL from environment (same as main app)
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    if not DATABASE_URL:
        print("❌ ERROR: DATABASE_URL environment variable not set")
        print("\n🔧 Options:")
        print("1. Set DATABASE_URL environment variable")
        print("2. Create a .env file in fastapi_backend/ directory")
        print("3. Pass DATABASE_URL as command line argument")
        return False
        
    if "sqlite" in DATABASE_URL:
        print("❌ ERROR: This script is for PostgreSQL databases only")
        print(f"   Current DATABASE_URL: {DATABASE_URL}")
        return False

    print(f"🔗 Connecting to: {DATABASE_URL[:60]}...")
    
    try:
        # Connect to database
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as conn:
            print("✅ Database connection successful!")
            
            # Admin user details
            email = 'admin@wealth.com'
            password_plain = 'admin123'
            password_hash = hashlib.sha256(password_plain.encode()).hexdigest()
            admin_id = str(uuid.uuid4())
            
            # Create users table if it doesn't exist
            print("📋 Creating users table if needed...")
            create_table_sql = """
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                risk_profile TEXT DEFAULT 'moderate',
                kyc_status TEXT DEFAULT 'unverified',
                is_admin TEXT DEFAULT 'false',
                profile_picture TEXT,
                credits FLOAT DEFAULT 0,
                last_login TIMESTAMP NULL,
                login_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
            conn.execute(text(create_table_sql))
            
            # Check if admin already exists
            print(f"🔍 Checking if admin exists: {email}")
            result = conn.execute(text("SELECT id FROM users WHERE email = :email"), {"email": email})
            existing_admin = result.fetchone()
            
            if existing_admin:
                print(f"✅ Admin user already exists: {email}")
                print("   Admin login credentials:")
                print(f"   📧 Email: {email}")
                print(f"   🔑 Password: {password_plain}")
                return True
            
            # Create admin user
            print(f"👤 Creating admin user: {email}")
            insert_sql = """
            INSERT INTO users (id, name, email, password, risk_profile, kyc_status, is_admin, created_at) 
            VALUES (:user_id, :name, :email, :password_hash, :risk_profile, :kyc_status, :is_admin, :created_at)
            """
            
            conn.execute(text(insert_sql), {
                "user_id": admin_id,
                "name": "System Administrator", 
                "email": email,
                "password_hash": password_hash,
                "risk_profile": "moderate",
                "kyc_status": "verified", 
                "is_admin": "true",
                "created_at": datetime.utcnow()
            })
            
            conn.commit()
            print("✅ Admin user created successfully!")
            print("\n📝 Admin Login Credentials:")
            print(f"   📧 Email: {email}")
            print(f"   🔑 Password: {password_plain}")
            print(f"   🆔 User ID: {admin_id}")
            
            return True
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        print("\n🔧 Troubleshooting:")
        print("1. Check your DATABASE_URL is correct")
        print("2. Verify database credentials and permissions")
        print("3. Ensure the database server is accessible")
        return False

if __name__ == "__main__":
    print("🚀 Creating admin user for deployed database...")
    print("=" * 50)
    
    # Allow DATABASE_URL to be passed as command line argument
    if len(sys.argv) > 1:
        os.environ["DATABASE_URL"] = sys.argv[1]
        print(f"📝 Using DATABASE_URL from command line")
    
    success = create_admin_user()
    
    print("=" * 50)
    if success:
        print("✅ COMPLETE: Admin user is ready for your deployed app!")
    else:
        print("❌ FAILED: Admin user creation unsuccessful")
        sys.exit(1)