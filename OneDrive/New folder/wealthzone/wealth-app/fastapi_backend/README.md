# FastAPI Wealth Management Backend

## Setup Instructions

### 1. Install Python Dependencies
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Database Setup
Make sure PostgreSQL is running and update the `.env` file with your database credentials:
```
DATABASE_URL=postgresql://username:password@localhost:5432/wealthapp
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### 3. Run the Application
```bash
# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8080

# Or use the batch file (Windows)
start.bat
```

### 4. API Documentation
- Swagger UI: http://localhost:8080/docs
- ReDoc: http://localhost:8080/redoc

### 5. Seed Test Data
POST to http://localhost:8080/api/auth/seed to create test users:
- Admin: admin@wealth.com / admin123
- User: john.doe@gmail.com / password123

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- GET `/api/auth/test` - Test endpoint
- POST `/api/auth/seed` - Seed test data
- GET `/api/auth/users` - Get all users

### Goals
- GET `/api/goals/` - Get user goals
- POST `/api/goals/` - Create goal
- GET `/api/goals/{id}` - Get specific goal
- PUT `/api/goals/{id}` - Update goal
- DELETE `/api/goals/{id}` - Delete goal

### Investments
- GET `/api/investments/` - Get user investments
- POST `/api/investments/` - Create investment
- GET `/api/investments/{id}` - Get specific investment
- PUT `/api/investments/{id}` - Update investment
- DELETE `/api/investments/{id}` - Delete investment

### Transactions
- GET `/api/transactions/` - Get user transactions
- POST `/api/transactions/` - Create transaction
- GET `/api/transactions/{id}` - Get specific transaction

### Dashboard
- GET `/api/dashboard/` - Get dashboard data

### Admin (Requires Admin Role)
- GET `/api/admin/dashboard` - Admin dashboard stats
- GET `/api/admin/users` - Get all users

## Frontend Integration
Update your frontend API service to point to `http://localhost:8000` instead of the .NET backend.