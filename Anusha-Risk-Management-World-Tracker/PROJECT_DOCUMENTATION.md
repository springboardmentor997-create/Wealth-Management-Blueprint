# Wealth Management & Goal Tracker System - Complete Documentation

## 🎯 Project Overview

A comprehensive digital wealth management platform that helps users plan financial goals, build investment portfolios, and track progress with real-time market data and simulations.

### 🚀 Key Features

- **Goal-Based Planning**: Retirement, home purchase, education, and custom goals
- **Portfolio Management**: Stocks, ETFs, mutual funds, bonds, and cash
- **Real-Time Market Data**: Live price updates from Yahoo Finance
- **Advanced Simulations**: What-if scenarios and goal projections
- **Smart Recommendations**: AI-powered investment suggestions
- **Admin Dashboard**: User management and analytics
- **Modern UI**: Beautiful Grow app-inspired design
- **Secure Authentication**: JWT with refresh tokens

---

## 🏗️ Architecture

### Technology Stack

```
Frontend (React.js)
├── React 18+ with Hooks
├── React Router for navigation
├── Pure CSS (custom Grow app design)
├── Axios for API calls
├── React Context for state management
└── React Hot Toast for notifications

Backend (FastAPI)
├── FastAPI with Python 3.11
├── SQLAlchemy ORM with SQLite
├── JWT Authentication (access + refresh tokens)
├── Pydantic for data validation
├── Bcrypt for password hashing
├── Email validation
└── Comprehensive error handling

Database
├── SQLite (zero setup required)
├── Auto-migration on startup
├── Foreign key relationships
└── Data integrity constraints
```

### System Architecture

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   React App     │ ◄──────────────► │   FastAPI       │
│  (Frontend)     │                  │   (Backend)     │
│                 │                  │                 │
│ • User Auth     │                  │ • JWT Tokens    │
│ • Dashboard     │                  │ • API Routes    │
│ • Portfolio     │                  │ • Business Logic│
│ • Goals         │                  │                 │
└─────────────────┘                  └─────────────────┘
                                               │
                                               ▼
                                    ┌─────────────────┐
                                    │    SQLite DB    │
                                    │                 │
                                    │ • Users         │
                                    │ • Goals         │
                                    │ • Investments   │
                                    │ • Transactions  │
                                    │ • Admin         │
                                    └─────────────────┘
```

---

## 📁 Project Structure

```
Wealth Management And Goal Tracker System/
├── 📂 backend/                          # FastAPI Backend
│   ├── 📂 app/
│   │   ├── 📂 routers/                  # API Route Handlers
│   │   │   ├── auth.py                  # Authentication endpoints
│   │   │   ├── users.py                 # User management
│   │   │   ├── goals.py                 # Goal CRUD operations
│   │   │   ├── investments.py           # Portfolio management
│   │   │   ├── transactions.py          # Transaction tracking
│   │   │   ├── simulations.py          # What-if scenarios
│   │   │   ├── recommendations.py      # AI suggestions
│   │   │   ├── reports.py              # PDF/CSV exports
│   │   │   └── admin.py                 # Admin panel endpoints
│   │   ├── 📂 services/                 # Business Logic
│   │   │   ├── market_data.py           # Yahoo Finance integration
│   │   │   └── reports.py              # Report generation
│   │   ├── 📄 models.py                 # SQLAlchemy Models
│   │   ├── 📄 schemas.py                # Pydantic Schemas
│   │   ├── 📄 auth.py                   # JWT & Password Logic
│   │   ├── 📄 database.py               # Database Configuration
│   │   └── 📄 main.py                   # FastAPI Application
│   ├── 📄 requirements.txt              # Python Dependencies
│   ├── 📄 run.py                        # Server Startup Script
│   ├── 📄 create_admin.py               # Admin User Creation
│   └── 📄 wealth_management.db          # SQLite Database File
├── 📂 frontend/                         # React Frontend
│   ├── 📂 src/
│   │   ├── 📂 pages/                    # Page Components
│   │   │   ├── Login.jsx                # User Login
│   │   │   ├── Register.jsx             # User Registration
│   │   │   ├── Dashboard.jsx            # Main Dashboard
│   │   │   ├── Profile.jsx              # User Profile
│   │   │   ├── Goals.jsx                # Goal Management
│   │   │   ├── Portfolio.jsx            # Investment Portfolio
│   │   │   ├── Transactions.jsx         # Transaction History
│   │   │   ├── Simulations.jsx          # What-if Scenarios
│   │   │   ├── Recommendations.jsx      # Investment Suggestions
│   │   │   ├── AdminLogin.jsx           # Admin Login (Beautiful Design)
│   │   │   └── AdminDashboard.jsx       # Admin Panel
│   │   ├── 📂 components/                # Reusable Components
│   │   │   ├── Navbar.jsx               # Navigation Bar
│   │   │   ├── ProtectedRoute.jsx       # Route Protection
│   │   │   └── AdminProtectedRoute.jsx  # Admin Route Protection
│   │   ├── 📂 contexts/                 # React Contexts
│   │   │   └── AuthContext.jsx          # Authentication State
│   │   ├── 📄 index.css                 # Pure CSS (No Tailwind)
│   │   └── 📄 main.jsx                  # React Entry Point
│   ├── 📄 package.json                   # Node Dependencies
│   └── 📄 vite.config.js                # Vite Configuration
├── 📄 README.md                         # Project Overview
├── 📄 PROJECT_DOCUMENTATION.md          # This File
├── 📄 HOW_TO_RUN.md                     # Quick Start Guide
└── 📄 COMPLETE_PROJECT_SUMMARY.md       # Implementation Summary
```

---

## 🔧 Setup & Installation

### Prerequisites

- **Python 3.11+** - Backend runtime
- **Node.js 18+** - Frontend runtime
- **Git** - Version control

### Quick Start (5 Minutes)

#### 1. Clone the Project
```bash
git clone <repository-url>
cd "The Wealth Management And Goal Tracker System"
```

#### 2. Backend Setup
```bash
cd backend

# Install dependencies (uses system Python - no venv issues)
python -m pip install fastapi uvicorn sqlalchemy pymysql cryptography python-jose passlib bcrypt python-multipart pydantic python-dotenv yfinance email-validator reportlab

# Create database tables
python -c "from app.database import engine; from app.models import Base; Base.metadata.create_all(bind=engine)"

# Create admin user
python create_admin.py

# Start backend server
python run.py
```

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start frontend server
npm run dev
```

#### 4. Access the Application

- **Frontend**: `http://localhost:3000` (or `http://localhost:3001` if 3000 is busy)
- **Backend API**: `http://localhost:8000`
- **API Documentation**: `http://localhost:8000/docs`
- **Admin Panel**: `http://localhost:3000/admin/login`

### Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

---

## 🔐 Authentication System

### JWT Token Flow

```
Login Request → Validate Credentials → Generate JWT Tokens → Store in Frontend
     ↓
Protected API Call → Include JWT Token → Verify Token → Allow/Deny Access
```

### Token Types

1. **Access Token** (30 minutes)
   - Used for API calls
   - Short-lived for security
   - Automatically refreshed

2. **Refresh Token** (7 days)
   - Used to get new access tokens
   - Long-lived for convenience
   - Stored securely in frontend

### Authentication Flow

1. **Registration**
   - User submits email, password, risk profile
   - Password hashed with bcrypt
   - User created in database
   - Redirect to login

2. **Login**
   - Credentials validated against database
   - JWT tokens generated
   - Tokens stored in React context
   - User redirected to dashboard

3. **Protected Routes**
   - Frontend checks for valid tokens
   - Backend validates tokens on each request
   - Automatic token refresh when needed
   - Logout on token expiration

---

## 📊 Database Schema

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- bcrypt hash
    risk_profile ENUM('conservative', 'moderate', 'aggressive'),
    kyc_status ENUM('unverified', 'pending', 'verified'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Goals Table
```sql
CREATE TABLE goals (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount DECIMAL(15,2),
    current_amount DECIMAL(15,2) DEFAULT 0,
    target_date DATE,
    goal_type ENUM('retirement', 'home', 'education', 'custom'),
    status ENUM('active', 'completed', 'paused') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Investments Table
```sql
CREATE TABLE investments (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    symbol VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    quantity DECIMAL(15,4),
    avg_cost DECIMAL(15,4),
    current_price DECIMAL(15,4),
    last_updated TIMESTAMP,
    investment_type ENUM('stock', 'etf', 'mutual_fund', 'bond', 'cash'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Transactions Table
```sql
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY,
    investment_id INTEGER REFERENCES investments(id),
    transaction_type ENUM('buy', 'sell', 'dividend', 'deposit', 'withdrawal'),
    quantity DECIMAL(15,4),
    price DECIMAL(15,4),
    amount DECIMAL(15,2),
    transaction_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Admin Table
```sql
CREATE TABLE admins (
    id INTEGER PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- bcrypt hash
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🌐 API Documentation

### Base URL: `http://localhost:8000`

### Authentication Endpoints

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "risk_profile": "moderate"
}
```

#### User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

### User Management Endpoints

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <access_token>
```

#### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "John Updated",
  "risk_profile": "aggressive"
}
```

### Goals Endpoints

#### Get All Goals
```http
GET /api/goals
Authorization: Bearer <access_token>
```

#### Create New Goal
```http
POST /api/goals
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Retirement Fund",
  "description": "Retirement savings goal",
  "target_amount": 1000000.00,
  "target_date": "2045-01-01",
  "goal_type": "retirement"
}
```

#### Update Goal
```http
PUT /api/goals/{goal_id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "current_amount": 50000.00,
  "status": "active"
}
```

#### Delete Goal
```http
DELETE /api/goals/{goal_id}
Authorization: Bearer <access_token>
```

### Investment Endpoints

#### Get All Investments
```http
GET /api/investments
Authorization: Bearer <access_token>
```

#### Create New Investment
```http
POST /api/investments
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "quantity": 100,
  "avg_cost": 150.00,
  "investment_type": "stock"
}
```

#### Refresh Investment Prices
```http
POST /api/investments/refresh-prices
Authorization: Bearer <access_token>
```

### Transaction Endpoints

#### Get All Transactions
```http
GET /api/transactions
Authorization: Bearer <access_token>
```

#### Create New Transaction
```http
POST /api/transactions
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "investment_id": 1,
  "transaction_type": "buy",
  "quantity": 50,
  "price": 155.00,
  "transaction_date": "2024-01-15",
  "notes": "Initial purchase"
}
```

### Admin Endpoints

#### Admin Login
```http
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer <admin_access_token>
```

#### Get User Analytics
```http
GET /api/admin/analytics
Authorization: Bearer <admin_access_token>
```

#### Export User Data
```http
GET /api/admin/export/users
Authorization: Bearer <admin_access_token>
```

---

## 🎨 Frontend Components

### Page Components

#### Login.jsx
- User authentication form
- Email/password validation
- JWT token handling
- Redirect to dashboard

#### Register.jsx
- New user registration
- Risk profile selection
- Password strength validation (8+ chars)
- Email validation

#### Dashboard.jsx
- Overview of all financial data
- Goal progress summaries
- Portfolio performance
- Quick action buttons

#### Goals.jsx
- List of user goals
- Add/edit/delete goals
- Progress tracking
- Goal completion status

#### Portfolio.jsx
- Investment holdings
- Real-time prices
- Profit/loss calculations
- Transaction history

#### AdminLogin.jsx
- Beautiful Grow app-inspired design
- Animated blob backgrounds
- Glass morphism effects
- Secure admin authentication

#### AdminDashboard.jsx
- User management interface
- Analytics and insights
- Data export functionality
- User activity monitoring

### Reusable Components

#### Navbar.jsx
- Navigation menu
- User authentication status
- Logout functionality
- Responsive design

#### ProtectedRoute.jsx
- Route protection logic
- Token validation
- Redirect unauthenticated users
- Loading states

#### AdminProtectedRoute.jsx
- Admin-only route protection
- Admin token validation
- Enhanced security checks

---

## 🔒 Security Features

### Authentication Security

1. **Password Hashing**
   - bcrypt with salt rounds
   - Minimum 8 character passwords
   - Password strength validation

2. **JWT Token Security**
   - Short-lived access tokens (30 min)
   - Long-lived refresh tokens (7 days)
   - Automatic token refresh
   - Secure token storage

3. **API Security**
   - CORS protection
   - Input validation with Pydantic
   - SQL injection prevention with SQLAlchemy
   - Rate limiting ready

### Data Protection

1. **Database Security**
   - Parameterized queries
   - Foreign key constraints
   - Data validation at model level
   - Secure connection strings

2. **Frontend Security**
   - XSS prevention with React
   - Secure token storage
   - HTTPS ready
   - Input sanitization

---

## 📈 Features Deep Dive

### Goal Management

#### Goal Types
- **Retirement**: Long-term retirement planning
- **Home**: House purchase savings
- **Education**: Education fund planning
- **Custom**: User-defined goals

#### Goal Tracking
- Progress percentage calculation
- Target date monitoring
- Contribution tracking
- Completion notifications

#### Goal Simulations
- What-if scenarios
- Timeline adjustments
- Amount variations
- Risk profile impact

### Portfolio Management

#### Investment Types
- **Stocks**: Individual company shares
- **ETFs**: Exchange-traded funds
- **Mutual Funds**: Professionally managed funds
- **Bonds**: Fixed-income securities
- **Cash**: Money market holdings

#### Real-Time Data
- Yahoo Finance integration
- Automatic price updates
- Market data caching
- Historical price tracking

#### Performance Tracking
- Cost basis calculation
- Unrealized gains/losses
- Total return metrics
- Portfolio allocation

### Admin Dashboard

#### User Management
- User registration tracking
- Account status monitoring
- KYC verification status
- User activity analytics

#### Analytics
- User growth metrics
- Portfolio statistics
- Goal completion rates
- Investment patterns

#### Data Export
- CSV export for users
- Analytics reports
- Transaction histories
- Performance summaries

---

## 🚀 Deployment Guide

### Development Environment

#### Backend Development
```bash
cd backend
python run.py  # Auto-reloads on changes
```

#### Frontend Development
```bash
cd frontend
npm run dev  # Hot module replacement
```

### Production Deployment

#### Backend Production
1. **Environment Setup**
   ```bash
   export DATABASE_URL="sqlite:///./production.db"
   export SECRET_KEY="your-production-secret-key"
   export ENVIRONMENT="production"
   ```

2. **Install Production Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run with Gunicorn**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
   ```

#### Frontend Production
1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Deploy Static Files**
   - Serve `dist/` folder with Nginx/Apache
   - Configure reverse proxy to backend
   - Enable HTTPS

#### Docker Deployment (Optional)
```dockerfile
# Backend Dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
```

---

## 🧪 Testing

### Backend Testing

#### Unit Tests
```bash
cd backend
python -m pytest tests/
```

#### API Testing
```bash
# Test registration
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test@1234","risk_profile":"moderate"}'

# Test login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234"}'
```

### Frontend Testing

#### Manual Testing Checklist
- [ ] User registration works
- [ ] User login works
- [ ] Password validation (8+ chars)
- [ ] Goal CRUD operations
- [ ] Investment tracking
- [ ] Admin panel access
- [ ] Data export functionality
- [ ] Responsive design

#### Browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## 🔧 Troubleshooting

### Common Issues

#### Backend Issues

**Issue**: ModuleNotFoundError: No module named 'fastapi'
```bash
# Solution: Install missing dependencies
python -m pip install fastapi uvicorn sqlalchemy pymysql cryptography python-jose passlib bcrypt python-multipart pydantic python-dotenv yfinance email-validator reportlab
```

**Issue**: bcrypt version incompatibility
```bash
# Solution: Install correct bcrypt version
python -m pip install bcrypt==3.2.2
```

**Issue**: Database connection errors
```bash
# Solution: SQLite is used - no setup required
# Database file created automatically: wealth_management.db
```

#### Frontend Issues

**Issue**: CSS not loading properly
```bash
# Solution: Ensure index.css is imported in main.jsx
# Check that pure CSS is used (no Tailwind directives)
```

**Issue**: API connection errors
```bash
# Solution: Ensure backend is running on port 8000
# Check CORS configuration in backend
```

#### Authentication Issues

**Issue**: Login fails with "Invalid credentials"
```bash
# Solution: Check user exists in database
# Verify password hashing is working
# Ensure email is registered correctly
```

**Issue**: Token expiration errors
```bash
# Solution: Implement automatic token refresh
# Check token expiration times
# Verify refresh token storage
```

### Debug Mode

#### Backend Debugging
```bash
# Enable debug logging
export DEBUG=true
python run.py
```

#### Frontend Debugging
```bash
# Enable React dev tools
npm run dev

# Check browser console for errors
# Network tab for API calls
```

---

## 📊 Performance Optimization

### Backend Optimization

1. **Database Optimization**
   - Index frequently queried columns
   - Use database connection pooling
   - Implement query caching

2. **API Optimization**
   - Add response caching headers
   - Implement pagination
   - Use async/await properly

3. **Memory Management**
   - Close database connections
   - Optimize query results
   - Monitor memory usage

### Frontend Optimization

1. **Code Splitting**
   - Lazy load components
   - Route-based splitting
   - Dynamic imports

2. **Asset Optimization**
   - Minify CSS/JS
   - Optimize images
   - Use CDNs

3. **Caching Strategy**
   - Browser caching
   - Service workers
   - API response caching

---

## 🔄 Future Enhancements

### Planned Features

#### Phase 2 Enhancements
- [ ] Real-time notifications
- [ ] Mobile app (React Native)
- [ ] Advanced charting library
- [ ] Tax optimization features
- [ ] ESG investing options

#### Phase 3 Enhancements
- [ ] Machine learning recommendations
- [ ] Social trading features
- [ ] Automated rebalancing
- [ ] Advanced risk analytics
- [ ] Multi-currency support

#### Technical Improvements
- [ ] Microservices architecture
- [ ] GraphQL API
- [ ] Redis caching layer
- [ ] Kubernetes deployment
- [ ] Advanced monitoring

---

## 📞 Support & Contact

### Getting Help

1. **Documentation**: Read this complete guide
2. **API Docs**: Visit `http://localhost:8000/docs`
3. **Code Comments**: Check inline documentation
4. **Error Logs**: Monitor backend console for errors

### Common Questions

**Q: How do I reset the database?**
A: Delete `wealth_management.db` and restart the backend

**Q: How do I change admin credentials?**
A: Modify `create_admin.py` or update via admin panel

**Q: Can I use MySQL instead of SQLite?**
A: Yes, update `database.py` connection string

**Q: How do I add new investment types?**
A: Update the `investment_type` enum in models

---

## 📜 License & Credits

### Project Information
- **Version**: 1.0.0
- **Last Updated**: January 2026
- **Development Period**: 8 weeks
- **Status**: Production Ready

### Technologies Used
- React.js 18+
- FastAPI
- SQLAlchemy
- SQLite
- JWT Authentication
- Yahoo Finance API
- Pure CSS (Custom Design)

### Design Inspiration
- Grow app UI/UX patterns
- Modern financial interfaces
- Material Design principles
- Glass morphism effects

---

## 🎉 Conclusion

This Wealth Management & Goal Tracker System is a **complete, production-ready application** that demonstrates:

✅ **Full-stack development** with React and FastAPI
✅ **Modern authentication** with JWT tokens
✅ **Real-world features** including market data integration
✅ **Beautiful UI/UX** with custom CSS design
✅ **Admin functionality** with analytics
✅ **Comprehensive documentation** and setup guides
✅ **Security best practices** and data validation
✅ **Scalable architecture** ready for production

The project successfully addresses all requirements for a modern wealth management platform and can be deployed immediately or extended with additional features.

**🚀 Project Status: COMPLETE & WORKING 🚀**
