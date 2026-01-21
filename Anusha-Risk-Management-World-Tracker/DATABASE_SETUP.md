# 🗄️ Database Setup Guide

## Where to Create the Database

You need to create the database in **PostgreSQL**. Here are the different ways to do it:

---

## Method 1: Using pgAdmin (GUI - Easiest) ⭐ Recommended

**pgAdmin** is a graphical tool for managing PostgreSQL databases.

### Steps:

1. **Install pgAdmin** (if not installed):
   - Download from: https://www.pgadmin.org/download/
   - Or install with PostgreSQL installer (usually included)

2. **Open pgAdmin**

3. **Connect to PostgreSQL Server:**
   - In the left panel, expand "Servers"
   - Right-click on your PostgreSQL server (usually "PostgreSQL 15" or similar)
   - Enter your PostgreSQL password when prompted

4. **Create Database:**
   - Right-click on "Databases"
   - Select "Create" → "Database..."
   - In the "Database" field, enter: `wealth_management_db`
   - Click "Save"

5. **Done!** ✅

---

## Method 2: Using psql (Command Line)

**psql** is the PostgreSQL command-line tool.

### Steps:

1. **Open Command Prompt/Terminal**

2. **Connect to PostgreSQL:**
   ```bash
   psql -U postgres
   ```
   (Replace `postgres` with your PostgreSQL username if different)

3. **Enter your PostgreSQL password when prompted**

4. **Create the database:**
   ```sql
   CREATE DATABASE wealth_management_db;
   ```

5. **Verify it was created:**
   ```sql
   \l
   ```
   (You should see `wealth_management_db` in the list)

6. **Exit psql:**
   ```sql
   \q
   ```

---

## Method 3: Using DBeaver (Free Database Tool)

**DBeaver** is a universal database tool that works with PostgreSQL.

### Steps:

1. **Install DBeaver:**
   - Download from: https://dbeaver.io/download/

2. **Create PostgreSQL Connection:**
   - Open DBeaver
   - Click "New Database Connection"
   - Select "PostgreSQL"
   - Enter connection details:
     - Host: `localhost`
     - Port: `5432`
     - Database: `postgres` (default)
     - Username: Your PostgreSQL username
     - Password: Your PostgreSQL password
   - Click "Test Connection" then "Finish"

3. **Create Database:**
   - Right-click on your connection
   - Select "SQL Editor" → "New SQL Script"
   - Type: `CREATE DATABASE wealth_management_db;`
   - Click "Execute SQL Script" (or press Ctrl+Enter)

4. **Done!** ✅

---

## Method 4: Using SQL Workbench/J

Similar to DBeaver, another free database tool.

---

## Method 5: Using Command Line (Windows)

### If PostgreSQL is in your PATH:

```bash
# Create database directly
createdb -U postgres wealth_management_db
```

### If PostgreSQL is NOT in your PATH:

1. Navigate to PostgreSQL bin directory:
   ```bash
   cd "C:\Program Files\PostgreSQL\15\bin"
   ```
   (Adjust version number as needed)

2. Run:
   ```bash
   createdb.exe -U postgres wealth_management_db
   ```

---

## Method 6: Using Python Script

You can also create it programmatically:

```python
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Connect to PostgreSQL (default database)
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    user="postgres",
    password="your_password"
)
conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)

# Create database
cursor = conn.cursor()
cursor.execute("CREATE DATABASE wealth_management_db")
cursor.close()
conn.close()

print("Database created successfully!")
```

---

## ✅ Verification

After creating the database, verify it exists:

### In pgAdmin:
- Expand "Databases" in left panel
- You should see `wealth_management_db`

### In psql:
```sql
psql -U postgres -l
```
Look for `wealth_management_db` in the list

### In DBeaver:
- Refresh your connection
- You should see `wealth_management_db` in the database list

---

## 🔧 Update Your .env File

After creating the database, update `backend/.env`:

```env
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/wealth_management_db
```

**Important:** Replace:
- `your_username` - Your PostgreSQL username (usually `postgres`)
- `your_password` - Your PostgreSQL password

---

## 🐛 Troubleshooting

### Problem: "database does not exist"
- **Solution:** Make sure you created the database with the exact name: `wealth_management_db`

### Problem: "password authentication failed"
- **Solution:** Check your PostgreSQL username and password in the DATABASE_URL

### Problem: "connection refused"
- **Solution:** 
  - Make sure PostgreSQL service is running
  - Check if PostgreSQL is listening on port 5432
  - Verify host is `localhost`

### Problem: "permission denied"
- **Solution:** Make sure your PostgreSQL user has permission to create databases

---

## 📝 Default PostgreSQL Credentials

If you just installed PostgreSQL:
- **Username:** `postgres`
- **Password:** The one you set during installation
- **Port:** `5432` (default)
- **Host:** `localhost`

---

## 🎯 Recommended Method

**For beginners:** Use **pgAdmin** (Method 1) - it's visual and easy to use.

**For experienced users:** Use **psql** (Method 2) - it's fast and direct.

---

## ✅ Next Steps

After creating the database:

1. Update `backend/.env` with your DATABASE_URL
2. Run the backend: `python run.py`
3. The tables will be automatically created on first run!

The database tables (Users, Goals, Investments, etc.) are created automatically by the application when you first start the backend. You don't need to create them manually! 🎉



