# ⚡ Quick MySQL Setup

## 🎯 For Users with MySQL (Not PostgreSQL)

The project has been **updated to use MySQL**! Follow these simple steps:

---

## Step 1: Create Database (Choose One Method)

### Method A: MySQL Command Line
```bash
mysql -u root -p
# Enter password
CREATE DATABASE wealth_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Method B: MySQL Workbench
1. Open MySQL Workbench
2. Connect to server
3. Create new schema: `wealth_management_db`
4. Charset: `utf8mb4`, Collation: `utf8mb4_unicode_ci`

### Method C: phpMyAdmin (XAMPP/WAMP)
1. Open `http://localhost/phpmyadmin`
2. Click "New"
3. Database name: `wealth_management_db`
4. Collation: `utf8mb4_unicode_ci`
5. Click "Create"

---

## Step 2: Update Backend .env File

Create `backend/.env`:

```env
# MySQL Database
DATABASE_URL=mysql+pymysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/wealth_management_db

# JWT
SECRET_KEY=your-random-32-character-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

**Important:** Replace:
- `root` → Your MySQL username
- `YOUR_MYSQL_PASSWORD` → Your MySQL password
- `3306` → MySQL port (default is 3306)

---

## Step 3: Install Dependencies

```bash
cd backend
venv\Scripts\activate  # Windows
# OR
source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
```

This installs `pymysql` (MySQL driver for Python).

---

## Step 4: Run Backend

```bash
python run.py
```

Tables will be **automatically created**! ✅

---

## Step 5: Run Frontend

```bash
# In a NEW terminal
cd frontend
npm install
npm run dev
```

---

## ✅ Done!

Open: `http://localhost:3000`

---

## 🐛 Common Issues

**"Access denied"** → Check MySQL username/password in `.env`

**"Unknown database"** → Make sure you created the database first

**"ModuleNotFoundError: pymysql"** → Run `pip install pymysql`

---

For detailed instructions, see `MYSQL_SETUP.md`

