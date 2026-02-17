#!/usr/bin/env python3
"""
Create admin user for deployed database (PostgreSQL or SQLite fallback)
This script works with whatever database your deployed app is using.
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
        print("🔄 Falling back to SQLite...")
        DATABASE_URL = "sqlite:///./wealth_app_new.db"
        
    print(f"🔗 Connecting to: {DATABASE_URL[:60]}...")
    
    # For SQLite, use a simpler approach
    if "sqlite" in DATABASE_URL:
        return create_admin_sqlite()
    
    try:
        # Connect to PostgreSQL database
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as conn:
            print("✅ PostgreSQL connection successful!")
            return create_admin_postgresql(conn)
            
    except Exception as e:
        print(f"❌ PostgreSQL ERROR: {str(e)}")
        print("🔄 Falling back to SQLite...")
        return create_admin_sqlite()

def create_admin_postgresql(conn):
    """Create admin user in PostgreSQL"""
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
    else:
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
    
    return True

def create_admin_sqlite():
    """Create admin user in SQLite (fallback)"""
    import sqlite3
    
    print("🗄️  Using SQLite database...")
    
    # SQLite database path (same as used in app)
    db_path = Path(__file__).parent.parent / "wealth_app_new.db"
    
    email = 'admin@wealth.com'
    alt_email = 'admin@wealthapp.com'
    password_plain = 'admin123'
    password_hash = hashlib.sha256(password_plain.encode()).hexdigest()
    
    try:
        print(f"🔗 Connecting to SQLite: {db_path}")
        
        # Connect to SQLite database
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Create users table if it doesn't exist
        print("📋 Creating users table if needed...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            risk_profile TEXT DEFAULT 'moderate',
            kyc_status TEXT DEFAULT 'unverified',
            is_admin TEXT DEFAULT 'false',
            profile_picture TEXT,
            credits REAL DEFAULT 0,
            last_login TIMESTAMP NULL,
            login_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        # Create both admin emails for compatibility
        for admin_email in [email, alt_email]:
            cursor.execute("SELECT id FROM users WHERE email = ?", (admin_email,))
            existing_admin = cursor.fetchone()
            
            if not existing_admin:
                admin_id = str(uuid.uuid4())
                print(f"👤 Creating admin user: {admin_email}")
                cursor.execute("""
                INSERT INTO users (id, name, email, password, risk_profile, kyc_status, is_admin, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    admin_id,
                    "System Administrator", 
                    admin_email,
                    password_hash,
                    "moderate",
                    "verified", 
                    "true",
                    datetime.utcnow().isoformat()
                ))
            else:
                print(f"✅ Admin user already exists: {admin_email}")
        
        # Commit changes
        conn.commit()
        conn.close()
        
        print("\n📝 Admin Login Credentials (both work):")
        print(f"   📧 Email: {email} OR {alt_email}")
        print(f"   🔑 Password: {password_plain}")
        
        return True
        
    except Exception as e:
        print(f"❌ SQLite ERROR: {str(e)}")
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