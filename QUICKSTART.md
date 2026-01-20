# 🚀 Quick Start Guide

## Option 1: Docker (Easiest)

```bash
# 1. Clone repository
git clone <repo-url>
cd Wealth-Manager/Final

# 2. Copy environment template
cp .env.example .env
# Edit .env with your Google OAuth credentials

# 3. Start services
docker-compose up -d

# 4. Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

**Stop Services:**
```bash
docker-compose down
```

---

## Option 2: Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 13+

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create .env file
cp ../.env.example .env
# Edit with your settings

# 5. Run backend
python main.py
# Runs on http://localhost:8000
```

### Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env.local
echo "VITE_API_URL=http://localhost:8000" > .env.local
echo "VITE_GOOGLE_CLIENT_ID=your-client-id" >> .env.local

# 4. Run frontend
npm run dev
# Runs on http://localhost:5173
```

---

## First Time Setup

1. **Create Google OAuth Credentials**
   - Go to https://console.cloud.google.com
   - Create a new project
   - Create OAuth 2.0 credentials (Web Application)
   - Add redirect URIs:
     - http://localhost:5173/login
     - http://localhost:3000/login

2. **Update .env file**
   ```bash
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   SECRET_KEY=$(openssl rand -hex 32)  # Generate random key
   ```

3. **Database**
   - PostgreSQL will be automatically created in Docker
   - For local: Create database manually
     ```sql
     CREATE DATABASE wealth_manager;
     ```

4. **Access Application**
   - Open http://localhost:5173 (local) or http://localhost:3000 (Docker)
   - Click "Google Login" or Register
   - Complete risk assessment quiz
   - Add investments to portfolio

---

## Common Commands

### Backend

```bash
cd backend

# Run server
python main.py

# Run tests
pytest

# Format code
black .

# Check linting
flake8 .

# Run in production
gunicorn -w 4 -b 0.0.0.0:8000 main:app
```

### Frontend

```bash
cd frontend

# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

### Docker

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart backend
```

---

## API Documentation

Once the backend is running, visit:
- **Interactive Docs:** http://localhost:8000/docs
- **Alternative Docs:** http://localhost:8000/redoc

### Authentication

1. **Register**
   ```bash
   curl -X POST http://localhost:8000/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user@example.com",
       "password": "secure_password"
     }'
   ```

2. **Login**
   ```bash
   curl -X POST http://localhost:8000/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user@example.com",
       "password": "secure_password"
     }'
   ```

3. **Use Token**
   ```bash
   curl http://localhost:8000/dashboard/summary \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

---

## Troubleshooting

### Port Already in Use

**Port 8000 (Backend):**
```bash
lsof -i :8000
kill -9 <PID>
```

**Port 5173/3000 (Frontend):**
```bash
# Use different port
npm run dev -- --port 3001
```

### Database Connection Error

```bash
# Check PostgreSQL is running
psql -U wealth_user -d wealth_manager

# Or in Docker
docker exec wealth-manager-db psql -U wealth_user
```

### OAuth Redirect Error

Ensure redirect URIs match exactly:
- Dev: http://localhost:5173/login
- Docker: http://localhost:3000/login
- Production: https://yourdomain.com/login

### Can't Connect to API

```bash
# Verify backend is running
curl http://localhost:8000/health

# Check CORS settings
# Should see Access-Control headers in response
```

---

## Project Structure Overview

```
Wealth-Manager/Final/
├── backend/           # FastAPI backend
│   ├── models/        # Database models
│   ├── routes/        # API endpoints
│   ├── core/          # Core utilities
│   └── main.py        # FastAPI app
├── frontend/          # React frontend
│   └── src/
│       ├── pages/     # Page components
│       ├── components/# Reusable components
│       └── api/       # API client
├── docker-compose.yml # Docker services
├── Dockerfile         # Backend container
├── DEPLOYMENT.md      # Production guide
└── README.md          # Full documentation
```

---

## Features Overview

✅ **Authentication**: Google OAuth + JWT  
✅ **Portfolio Tracking**: Investments, transactions, performance  
✅ **Goals**: Create and track financial goals  
✅ **Watchlist**: Track favorite stocks  
✅ **Risk Assessment**: 5-question quiz  
✅ **Personalized Suggestions**: Portfolio recommendations  
✅ **Reports**: Comprehensive PDF/CSV exports  
✅ **Market Data**: Real-time stock/crypto prices  
✅ **Simulations**: What-if scenario analysis  

---

## Next Steps

1. ✅ Start the application
2. ✅ Create an account or login
3. ✅ Take risk assessment quiz
4. ✅ Add investments to portfolio
5. ✅ Add items to watchlist
6. ✅ View personalized suggestions
7. ✅ Export comprehensive reports
8. ✅ Set financial goals

---

## Getting Help

- **API Docs:** http://localhost:8000/docs
- **Issues:** Check GitHub issues
- **Email:** support@wealthmanager.com

---

**Happy wealth management! 💰**
