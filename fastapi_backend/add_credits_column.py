import sqlite3
import os

def migrate_credits():
    db_path = 'wealth_app_new.db'
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Add credits column if it doesn't exist
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN credits REAL DEFAULT 0.0")
            print("Added credits column")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("credits column already exists")
            else:
                raise e
        
        conn.commit()
        print("Database migration completed!")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_credits()
