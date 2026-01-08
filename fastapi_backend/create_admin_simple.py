import sqlite3
import hashlib
import uuid
from datetime import datetime

def create_admin_user():
    try:
        # Connect to SQLite database
        conn = sqlite3.connect('wealth_app_new.db')
        cursor = conn.cursor()
        
        # Check if admin exists
        cursor.execute("SELECT * FROM users WHERE email = ?", ("admin@wealth.com",))
        if cursor.fetchone():
            print("Admin user already exists")
            return
        
        # Create admin user with simple hash
        password_hash = hashlib.sha256("admin123".encode()).hexdigest()
        user_id = str(uuid.uuid4())
        
        cursor.execute("""
            INSERT INTO users (id, name, email, password, risk_profile, kyc_status, is_admin, login_count, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            "System Administrator",
            "admin@wealth.com", 
            password_hash,
            "moderate",
            "verified",
            "true",
            0,
            datetime.utcnow().isoformat()
        ))
        
        conn.commit()
        print("Admin user created successfully!")
        print("Email: admin@wealth.com")
        print("Password: admin123")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    create_admin_user()