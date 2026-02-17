#!/usr/bin/env python3
"""
Create admin user for SQLite database (for deployed app fallback)
This creates the admin user in the SQLite database that your app is currently using.
"""

import sqlite3
import hashlib
import uuid
from datetime import datetime
import os
from pathlib import Path

def create_admin_user_sqlite():
    print("🗄️  Creating admin user in SQLite database...")
    print("=" * 50)
    
    # SQLite database path (same as used in app)
    db_path = Path(__file__).parent.parent / "wealth_app_new.db"
    
    # Admin user details
    email = 'admin@wealth.com'
    password_plain = 'admin123'
    password_hash = hashlib.sha256(password_plain.encode()).hexdigest()
    admin_id = str(uuid.uuid4())
    
    try:
        print(f"🔗 Connecting to SQLite: {db_path}")
        
        # Connect to SQLite database
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        print("✅ SQLite connection successful!")
        
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
        
        # Check if admin already exists
        print(f"🔍 Checking if admin exists: {email}")
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        existing_admin = cursor.fetchone()
        
        if existing_admin:
            print(f"✅ Admin user already exists: {email}")
        else:
            # Create admin user
            print(f"👤 Creating admin user: {email}")
            cursor.execute("""
            INSERT INTO users (id, name, email, password, risk_profile, kyc_status, is_admin, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                admin_id,
                "System Administrator", 
                email,
                password_hash,
                "moderate",
                "verified", 
                "true",
                datetime.utcnow().isoformat()
            ))
            
            print("✅ Admin user created successfully!")
        
        # Also create the alternative email for compatibility
        alt_email = 'admin@wealthapp.com'
        print(f"🔍 Checking alternative admin: {alt_email}")
        cursor.execute("SELECT id FROM users WHERE email = ?", (alt_email,))
        existing_alt = cursor.fetchone()
        
        if not existing_alt:
            alt_id = str(uuid.uuid4())
            print(f"👤 Creating alternative admin: {alt_email}")
            cursor.execute("""
            INSERT INTO users (id, name, email, password, risk_profile, kyc_status, is_admin, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                alt_id,
                "System Administrator", 
                alt_email,
                password_hash,
                "moderate",
                "verified", 
                "true",
                datetime.utcnow().isoformat()
            ))
            print("✅ Alternative admin created successfully!")
        
        # Commit changes
        conn.commit()
        conn.close()
        
        print("\n📝 Admin Login Credentials (both work):")
        print(f"   📧 Email: {email} OR {alt_email}")
        print(f"   🔑 Password: {password_plain}")
        print(f"\n💡 Your deployed app is using SQLite fallback, so these credentials should work now!")
        
        return True
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Creating admin user for SQLite database...")
    success = create_admin_user_sqlite()
    
    print("=" * 50)
    if success:
        print("✅ COMPLETE: Admin user ready for SQLite database!")
        print("🔄 Restart your deployed app to use the new admin user.")
    else:
        print("❌ FAILED: Admin user creation unsuccessful")