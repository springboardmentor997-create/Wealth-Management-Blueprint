# 🗄️ MySQL Setup Guide

## ✅ Project Updated for MySQL!

The project has been configured to use **MySQL** instead of PostgreSQL.

---

## 📋 Prerequisites

1. **MySQL Server** installed and running
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Or use XAMPP/WAMP which includes MySQL

2. **MySQL Workbench** (Optional - GUI tool)
   - Download from: https://dev.mysql.com/downloads/workbench/

---

## 🔧 Step 1: Create MySQL Database

### Method 1: Using MySQL Command Line

1. **Open MySQL Command Line Client** or terminal

2. **Login to MySQL:**
   ```bash
   mysql -u root -p
   ```
   (Enter your MySQL root password)

3. **Create the database:**
   ```sql
   CREATE DATABASE wealth_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **Verify:**
   ```sql
   SHOW DATABASES;
   ```
   (You should see `wealth_management_db` in the list)

5. **Exit:**
   ```sql
   EXIT;
   ```

### Method 2: Using MySQL Workbench (GUI)

1. **Open MySQL Workbench**

2. **Connect to your MySQL server**

3. **Create Database:**
   - Click the "Create a new schema" button (or right-click → Create Schema)
   - Name: `wealth_management_db`
   - Charset: `utf8mb4`
   - Collation: `utf8mb4_unicode_ci`
   - Click "Apply"

4. **Done!** ✅

### Method 3: Using phpMyAdmin (if using XAMPP/WAMP)

1. **Open phpMyAdmin** (usually at `http://localhost/phpmyadmin`)

2. **Click "New" in the left sidebar**

3. **Enter database name:** `wealth_management_db`

4. **Select Collation:** `utf8mb4_unicode_ci`

5. **Click "Create"**

---

## 🔧 Step 2: Update Backend Configuration

1. **Create `.env` file in `backend/` directory:**

   ```env
   # MySQL Database Configuration
   # Format: mysql+pymysql://username:password@host:port/database
   DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/wealth_management_db

   # JWT Authentication
   SECRET_KEY=your-super-secret-key-change-this-in-production-min-32-characters
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7

   # Redis (Optional - for Celery)
   REDIS_URL=redis://localhost:6379/0

   # External APIs (Optional)
   YAHOO_FINANCE_ENABLED=true
   ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key-here
   ```

2. **Important:** Replace in DATABASE_URL:
   - `root` - Your MySQL username (usually `root`)
   - `your_password` - Your MySQL password
   - `3306` - MySQL port (default is 3306)
   - `wealth_management_db` - Database name

---

## 🔧 Step 3: Install MySQL Python Driver

1. **Activate your virtual environment:**
   ```bash
   cd backend
   venv\Scripts\activate  # Windows
   # OR
   source venv/bin/activate  # Mac/Linux
   ```

2. **Install/Update dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

   This will install `pymysql` which is the MySQL driver for Python.

---

## 🚀 Step 4: Run the Application

1. **Start the backend:**
   ```bash
   python run.py
   ```

2. **The tables will be automatically created!** ✅

   You should see:
   ```
   INFO:     Uvicorn running on http://0.0.0.0:8000
   ```

3. **Verify in MySQL:**
   ```sql
   USE wealth_management_db;
   SHOW TABLES;
   ```
   
   You should see tables like:
   - users
   - goals
   - investments
   - transactions
   - recommendations
   - simulations

---

## 📝 MySQL Connection String Format

```
mysql+pymysql://username:password@host:port/database
```

**Examples:**

- Local MySQL with root user:
  ```
  mysql+pymysql://root:mypassword@localhost:3306/wealth_management_db
  ```

- MySQL with custom user:
  ```
  mysql+pymysql://myuser:mypassword@localhost:3306/wealth_management_db
  ```

- Remote MySQL:
  ```
  mysql+pymysql://user:pass@192.168.1.100:3306/wealth_management_db
  ```

---

## 🐛 Troubleshooting

### Problem: "Access denied for user"
- **Solution:** Check your MySQL username and password in DATABASE_URL

### Problem: "Unknown database 'wealth_management_db'"
- **Solution:** Make sure you created the database first (see Step 1)

### Problem: "ModuleNotFoundError: No module named 'pymysql'"
- **Solution:** 
  ```bash
  pip install pymysql
  ```

### Problem: "Can't connect to MySQL server"
- **Solution:** 
  - Make sure MySQL service is running
  - Check if MySQL is listening on port 3306
  - Verify host is `localhost` (or correct IP)

### Problem: "Table doesn't exist"
- **Solution:** The tables are auto-created on first backend run. Make sure backend started successfully.

### Problem: "Character set issues"
- **Solution:** Make sure database is created with `utf8mb4` charset:
  ```sql
  CREATE DATABASE wealth_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```

---

## ✅ Verification Checklist

- [ ] MySQL is installed and running
- [ ] Database `wealth_management_db` is created
- [ ] `.env` file exists in `backend/` directory
- [ ] `DATABASE_URL` in `.env` is correct
- [ ] `pymysql` is installed (`pip install pymysql`)
- [ ] Backend runs without errors
- [ ] Tables are created automatically
- [ ] Can register/login in frontend

---

## 🎯 Quick Test

After setup, test the connection:

```python
# Test script (optional)
from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text("SELECT DATABASE()"))
    print(f"Connected to: {result.scalar()}")
```

---

## 📚 Additional Notes

1. **MySQL Version:** Works with MySQL 5.7+ and MariaDB 10.2+

2. **JSON Support:** MySQL 5.7+ supports JSON type, which is used for storing simulation results and recommendations

3. **Auto-increment:** MySQL uses AUTO_INCREMENT for primary keys (handled automatically by SQLAlchemy)

4. **Character Set:** Using `utf8mb4` ensures proper support for emojis and special characters

---

## 🎉 You're All Set!

Your project is now configured for MySQL. The application will work exactly the same as with PostgreSQL, but using MySQL as the database backend.

**Next Steps:**
1. Create the database (Step 1)
2. Update `.env` file (Step 2)
3. Install dependencies (Step 3)
4. Run the application (Step 4)

Enjoy! 🚀

