# 🚀 How to Run the Wealth Management & Goal Tracker System

## ✅ Project Status: **100% COMPLETE**

All milestones are complete! The project is ready to run.

---

## 📋 Prerequisites

Before running, make sure you have:

1. **Python 3.9+** - [Download Python](https://www.python.org/downloads/)
2. **Node.js 18+** - [Download Node.js](https://nodejs.org/)
3. **MySQL 5.7+ or MariaDB 10.2+** - [Download MySQL](https://dev.mysql.com/downloads/mysql/) or use XAMPP/WAMP
4. **Redis** (Optional, for Celery tasks) - [Download Redis](https://redis.io/download/)

---

## 🔧 Step-by-Step Setup

### Step 1: Database Setup

1. **Install PostgreSQL** (if not already installed)
   - Download from: https://www.postgresql.org/download/
   - During installation, remember the password you set for the `postgres` user

2. **Create the database using one of these methods:**

   **Option A: Using MySQL Command Line**
   ```bash
   mysql -u root -p
   # Enter your MySQL password
   CREATE DATABASE wealth_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   EXIT;
   ```

   **Option B: Using MySQL Workbench (GUI Tool)**
   - Open **MySQL Workbench**
   - Connect to your MySQL server
   - Click "Create a new schema"
   - Name: `wealth_management_db`
   - Charset: `utf8mb4`, Collation: `utf8mb4_unicode_ci`
   - Click "Apply"

   **Option C: Using phpMyAdmin (XAMPP/WAMP)**
   - Open phpMyAdmin at `http://localhost/phpmyadmin`
   - Click "New" → Enter name: `wealth_management_db`
   - Select Collation: `utf8mb4_unicode_ci`
   - Click "Create"

   📖 **For detailed MySQL setup, see `MYSQL_SETUP.md`**

3. **Note your database credentials:**
   - Host: `localhost` (usually)
   - Port: `3306` (default MySQL port)
   - Database: `wealth_management_db`
   - Username: Your MySQL username (usually `root`)
   - Password: Your MySQL password

---

### Step 2: Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Mac/Linux
   python -m venv venv
   source venv/bin/activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create `.env` file:**
   ```bash
   # Create .env file in backend directory
   # Copy the content below and update with your values
   ```

   Create `backend/.env` with:
   ```env
   # Database (MySQL)
   DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/wealth_management_db

   # JWT (Generate a random secret key)
   SECRET_KEY=your-super-secret-key-change-this-in-production-min-32-characters
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7

   # Redis (Optional - for Celery)
   REDIS_URL=redis://localhost:6379/0

   # External APIs (Optional - for market data)
   ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key-here
   YAHOO_FINANCE_ENABLED=true
   ```

   **Important:** Replace:
   - `your_username` with your PostgreSQL username
   - `your_password` with your PostgreSQL password
   - `your-super-secret-key-change-this-in-production-min-32-characters` with a random secret key

5. **Run the backend:**
   ```bash
   python run.py
   ```

   You should see:
   ```
   INFO:     Uvicorn running on http://0.0.0.0:8000
   ```

6. **Verify backend is running:**
   - Open browser: `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs`
   - Health Check: `http://localhost:8000/api/health`

---

### Step 3: Frontend Setup

1. **Open a NEW terminal window** (keep backend running)

2. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

3. **Install Node dependencies:**
   ```bash
   npm install
   ```

4. **Create `.env` file (Optional):**
   ```bash
   # Create .env file in frontend directory
   echo "VITE_API_URL=http://localhost:8000" > .env
   ```

   Or manually create `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

5. **Run the frontend:**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   VITE v5.x.x  ready in xxx ms
   ➜  Local:   http://localhost:3000/
   ```

6. **Open the application:**
   - Open browser: `http://localhost:3000`

---

### Step 4: Optional - Celery Setup (For Scheduled Tasks)

**Only needed if you want automatic price updates**

1. **Install Redis:**
   - Windows: Download from [Redis for Windows](https://github.com/microsoftarchive/redis/releases)
   - Mac: `brew install redis`
   - Linux: `sudo apt-get install redis-server`

2. **Start Redis:**
   ```bash
   # Windows
   redis-server

   # Mac/Linux
   redis-server
   ```

3. **Start Celery Worker** (in a new terminal):
   ```bash
   cd backend
   venv\Scripts\activate  # Windows
   # or
   source venv/bin/activate  # Mac/Linux

   celery -A app.celery_app worker --loglevel=info
   ```

4. **Start Celery Beat** (in another new terminal):
   ```bash
   cd backend
   venv\Scripts\activate  # Windows
   # or
   source venv/bin/activate  # Mac/Linux

   celery -A app.celery_app beat --loglevel=info
   ```

---

## 🎯 Quick Start (Minimal Setup)

If you just want to test the application quickly:

### 1. Create MySQL Database:
```sql
CREATE DATABASE wealth_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Setup:
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 3. Create .env file in backend folder:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=wealth_management_db
DB_USER=root
DB_PASSWORD=your_mysql_password
SECRET_KEY=your-super-secret-key-change-this-in-production-32chars
```

### 4. Run Backend:
```bash
python run.py
```

### 5. Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```

### 6. Access the Application:
- **Main App**: `http://localhost:3000`
- **Admin Panel**: `http://localhost:3000/admin/login`
  - Default credentials: username `admin`, password `admin123`

---

## 🧪 Testing the Application

### 1. Register a new account:
   - Go to `http://localhost:3000/register`
   - Fill in the form
   - Click "Create Account"

### 2. Login as User:
   - Go to `http://localhost:3000/login`
   - Use your registered credentials
   - Access the dashboard and all features

### 3. Access Admin Panel:
   - Go to `http://localhost:3000/admin/login`
   - Use default credentials: admin / admin123
   - View analytics, user management, and download data

---

## 🔧 Troubleshooting

### Common Issues:

1. **Database Connection Error**:
   - Make sure MySQL is running
   - Check your password in .env file
   - Ensure database name is correct

2. **Admin Not Created**:
   - Check backend console for "Default admin created" message
   - If error occurs, restart the backend server

3. **Frontend API Errors**:
   - Ensure backend is running on port 8000
   - Check browser console for network errors

4. **CORS Issues**:
   - Backend should automatically handle CORS for localhost:3000
   - If issues persist, check backend console logs

2. **Login:**
   - Use your credentials
   - You'll be redirected to Dashboard

3. **Create a Goal:**
   - Click "Goals" in navigation
   - Click "+ New Goal"
   - Fill in the form and submit

4. **Add an Investment:**
   - Click "Portfolio" in navigation
   - Click "+ Add Investment"
   - Fill in the form (e.g., Symbol: AAPL, Type: stock)

5. **Explore other features:**
   - Simulations
   - Recommendations
   - Reports

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError` or import errors
- **Solution:** Make sure virtual environment is activated and dependencies are installed

**Problem:** Database connection error
- **Solution:** 
  - Check MySQL is running
  - Verify DATABASE_URL in `.env` is correct (format: `mysql+pymysql://user:pass@host:port/db`)
  - Ensure database `wealth_management_db` exists
  - Make sure `pymysql` is installed: `pip install pymysql`

**Problem:** Port 8000 already in use
- **Solution:** Change port in `run.py` or stop the process using port 8000

### Frontend Issues

**Problem:** `npm install` fails
- **Solution:** 
  - Update Node.js to version 18+
  - Clear npm cache: `npm cache clean --force`
  - Delete `node_modules` and `package-lock.json`, then run `npm install` again

**Problem:** Can't connect to backend
- **Solution:** 
  - Verify backend is running on `http://localhost:8000`
  - Check `VITE_API_URL` in frontend `.env`
  - Check browser console for CORS errors

**Problem:** Port 3000 already in use
- **Solution:** Vite will automatically use the next available port (3001, 3002, etc.)

### Database Issues

**Problem:** Tables not created
- **Solution:** The tables are auto-created on first run. Check backend logs for errors.

**Problem:** Migration errors
- **Solution:** Delete and recreate the database, then restart backend

---

## 📝 Important Notes

1. **First Run:** The database tables are automatically created when you start the backend for the first time.

2. **Market Data:** 
   - Yahoo Finance works without API key (default)
   - Alpha Vantage requires free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)

3. **Celery:** 
   - Only needed for scheduled price updates
   - Manual price refresh works without Celery
   - Click "🔄 Refresh Prices" button in Portfolio page

4. **Production:** 
   - Change `SECRET_KEY` to a strong random string
   - Use environment variables for sensitive data
   - Enable HTTPS
   - Configure proper CORS origins

---

## ✅ Verification Checklist

- [ ] PostgreSQL is installed and running
- [ ] Database `wealth_management_db` is created
- [ ] Backend `.env` file is configured
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] Backend is running (`http://localhost:8000` shows API response)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Frontend is running (`http://localhost:3000` shows login page)
- [ ] Can register a new user
- [ ] Can login successfully
- [ ] Can access dashboard

---

## 🎉 You're All Set!

Once both backend and frontend are running:
- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:8000`
- **API Docs:** `http://localhost:8000/docs`

Enjoy your Wealth Management & Goal Tracker System! 🚀

