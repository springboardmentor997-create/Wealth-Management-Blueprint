import pg8000
import hashlib
import uuid
from datetime import datetime

conn = pg8000.connect(host='127.0.0.1', user='postgres', password='password123', database='wealthapp', port=5432)
cur = conn.cursor()

email = 'admin@wealth.com'
password_plain = 'admin123'
password_hash = hashlib.sha256(password_plain.encode()).hexdigest()

# Ensure users table exists - create if not
cur.execute("""
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
    created_at TIMESTAMP DEFAULT now()
)
""")
conn.commit()

# Check if admin exists
cur.execute("SELECT id FROM users WHERE email = %s", (email,))
row = cur.fetchone()
if row:
    print('Admin already exists in Postgres:', email)
else:
    new_id = str(uuid.uuid4())
    cur.execute(
        "INSERT INTO users (id, name, email, password, risk_profile, kyc_status, is_admin, created_at) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
        (new_id, 'System Administrator', email, password_hash, 'moderate', 'verified', 'true', datetime.utcnow())
    )
    conn.commit()
    print('Admin created in Postgres:', email)

cur.close()
conn.close()
