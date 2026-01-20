"""
Add missing columns to users table
"""
import psycopg2
from psycopg2 import sql

conn = psycopg2.connect(
    host="localhost",
    port=4000,
    database="wealth_db",
    user="postgres",
    password="Srusanth25"
)

cursor = conn.cursor()

try:
    # Add reset_token column if it doesn't exist
    cursor.execute("""
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS reset_token VARCHAR
    """)
    print("✅ Added reset_token column")
except Exception as e:
    print(f"⚠ reset_token: {e}")

try:
    # Add reset_token_expiry column if it doesn't exist
    cursor.execute("""
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP
    """)
    print("✅ Added reset_token_expiry column")
except Exception as e:
    print(f"⚠ reset_token_expiry: {e}")

# Create index on reset_token for faster lookups
try:
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token)
    """)
    print("✅ Created index on reset_token")
except Exception as e:
    print(f"⚠ Index: {e}")

conn.commit()
cursor.close()
conn.close()

print("✅ Migration complete!")
