# Wealth Management Platform

A complete digital wealth management platform for planning goals, building portfolios, and tracking progress with market-linked updates and simulations.

## Project Status (Current)
- **Status:**  Active & Verified
- **Backend:** FastAPI (Python 3.14 compatible)
- **Database:** PostgreSQL (Connected via `pg8000`)
- **Frontend:** React + Vite

## Features

### Module A: User Management & Security 
- **Secure Auth:** JWT-based Login/Registration
- **Admin System:** Dedicated Admin Dashboard (`/admin-login`)
- **Risk Profiling:** Automated risk assessment (Conservative/Moderate/Aggressive)

### Module B: Goals & Simulations 
- **Goal Tracking:** Set targets for Retirement, Housing, Education
- **Simulations:** "What-if" scenarios for financial planning
- **Calculators:** SIP, Loan, and Investment calculators

### Module C: Portfolio & Transactions 
- **Live Data:** Real-time stock/ETF prices via `yfinance`
- **Portfolio Tracking:** Holdings summary, Cost Basis vs Current Value
- **History:** 6-month portfolio performance visualization

### Module D: Analytics & Reports 
- **Reports:** PDF Portfolio Export generation
- **Recommendations:** Logic-based investment advice

## Tech Stack

- **Frontend**: React.js 18 + Tailwind CSS + Vite + Shadcn UI
- **Backend**: FastAPI + SQLAlchemy + Celery (Redis)
- **Database**: PostgreSQL (Driver: `pg8000` for Python 3.14 compatibility)
- **Authentication**: JWT (JSON Web Tokens) with BCrypt hashing

## Quick Start Guide

### 1. Backend Setup (FastAPI)
The backend is configured to use the `dilipppp` PostgreSQL database.

```bash
cd fastapi_backend

# 1. Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate

# 2. Install dependencies (ensure pg8000 is included)
pip install -r requirements.txt
pip install pg8000

# 3. Start the Server
start.bat
# OR Manual command:
# uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- **API URL:** http://localhost:8000
- **Swagger Docs:** http://localhost:8000/docs

### 2. Frontend Setup (React)

```bash
cd wealth_frontend

# 1. Install dependencies
npm install

# 2. Start Development Server
npm run dev
```
- **App URL:** http://localhost:5173

## Access Credentials

### Admin Account
Use these credentials to access the Admin Dashboard:
- **Login Page:** http://localhost:5173/admin-login
- **Email:** `admin@wealth.com`
- **Password:** `admin123`

### User Account
You can register a new user normally via the Sign Up page:
- **Login Page:** http://localhost:5173/auth

## Project Structure

```
Wealthapp/
 fastapi_backend/          # FastAPI Backend
    routers/              # API Endpoints (Goals, Portfolio, Auth)
    models.py             # Database Models
    schemas.py            # Pydantic Schemas
    market_service.py     # Yahoo Finance Integration
    report_generator.py   # PDF Generation Logic
    .env                  # Environment Variables
 wealth_frontend/          # React Frontend
    src/
       pages/            # Dashboard, Admin, Portfolio Pages
       services/         # API Integration
       components/       # UI Components
    vite.config.ts        # Vite Configuration
 README.md
```

## Troubleshooting

- **Database Connection Error:** Ensure PostgreSQL is running and `.env` has the correct `DATABASE_URL`.
- **"Relation does not exist":** Run `python init_dilipppp.py` in `fastapi_backend` to recreate tables.
- **Login 401 Unauthorized:** If the database was reset, clear your browser Local Storage or Re-Login to generate a new token.
