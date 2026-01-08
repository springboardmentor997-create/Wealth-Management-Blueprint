import sqlite3
import os

def migrate_database():
    db_path = 'wealth_app_new.db'
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Add profile_picture column if it doesn't exist
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN profile_picture TEXT")
            print("Added profile_picture column")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("profile_picture column already exists")
            else:
                raise e
        
        conn.commit()
        print("Database migration completed!")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()
