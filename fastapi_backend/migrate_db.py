import sqlite3
import hashlib
from datetime import datetime

def migrate_database():
    conn = sqlite3.connect('wealth_management.db')
    cursor = conn.cursor()
    
    try:
        # Add new columns if they don't exist
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN last_login TEXT")
            print("Added last_login column")
        except sqlite3.OperationalError:
            print("last_login column already exists")
        
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN login_count INTEGER DEFAULT 0")
            print("Added login_count column")
        except sqlite3.OperationalError:
            print("login_count column already exists")
        
        # Check if admin exists
        cursor.execute("SELECT * FROM users WHERE email = ?", ("admin@wealth.com",))
        if cursor.fetchone():
            print("Admin user already exists")
        else:
            # Create admin user
            password_hash = hashlib.sha256("admin123".encode()).hexdigest()
            cursor.execute("""
                INSERT INTO users (name, email, password, risk_profile, kyc_status, is_admin, login_count, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                "System Administrator",
                "admin@wealth.com",
                password_hash,
                "moderate", 
                "verified",
                "true",
                0,
                datetime.utcnow().isoformat()
            ))
            print("Admin user created!")
        
        conn.commit()
        print("Database migration completed!")
        print("Admin credentials: admin@wealth.com / admin123")
        
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()