import pg8000
import os

host = os.getenv('PG_HOST', '127.0.0.1')
port = int(os.getenv('PG_PORT', '5432'))
user = os.getenv('PG_USER', 'postgres')
password = os.getenv('PG_PASSWORD', 'Dilip3')

conn = pg8000.connect(host=host, user=user, password=password, database='postgres', port=port)
# Enable autocommit so CREATE DATABASE (which cannot run inside a transaction) succeeds
try:
    conn.autocommit = True
except Exception:
    # Some pg8000 versions use a different attribute name
    try:
        conn.isolation_level = None
    except Exception:
        pass
cur = conn.cursor()
cur.execute("SELECT 1 FROM pg_database WHERE datname='wealthapp'")
if cur.fetchone():
    print('Database "wealthapp" already exists')
else:
    print('Creating database "wealthapp"...')
    # CREATE DATABASE must run outside a transaction
    cur.execute('CREATE DATABASE wealthapp')
    print('Database created')

cur.close()
conn.close()