# Wealth Manager - Production Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Setup](#local-setup)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Deployment (Google Cloud Run)](#cloud-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [API Documentation](#api-documentation)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Docker & Docker Compose** (for containerized deployment)
- **Node.js 18+** (for frontend)
- **Python 3.11+** (for backend)
- **PostgreSQL 13+** (for database)
- **Google OAuth Credentials** (for authentication)
- **Git** (for version control)

---

## Local Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Wealth-Manager/Final
```

### 2. Create Environment File
```bash
cp .env.example .env
# Edit .env with your actual values
```

### 3. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run build
```

### 5. Database Setup
Create a PostgreSQL database and update `.env`:
```sql
CREATE DATABASE wealth_manager;
```

### 6. Run Locally
**Backend:**
```bash
cd backend
python main.py
# Server runs on http://localhost:8000
```

**Frontend:**
```bash
cd frontend
npm run dev
# Server runs on http://localhost:5173
```

---

## Docker Deployment

### 1. Build Images
```bash
docker-compose build
```

### 2. Start Services
```bash
# Development with auto-reload
docker-compose up

# Production (detached)
docker-compose up -d
```

### 3. Access Services
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### 4. Database Migrations
```bash
# Inside backend container
docker exec wealth-manager-backend python -m alembic upgrade head
```

### 5. View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 6. Stop Services
```bash
docker-compose down

# Also remove volumes
docker-compose down -v
```

---

## Cloud Deployment (Google Cloud Run)

### Prerequisites
- Google Cloud account with billing enabled
- `gcloud` CLI installed
- Docker installed

### 1. Setup Google Cloud Project
```bash
gcloud config set project YOUR_PROJECT_ID
gcloud auth login
```

### 2. Enable Required APIs
```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  cloudresourcemanager.googleapis.com
```

### 3. Create Cloud SQL Database
```bash
# Create PostgreSQL instance
gcloud sql instances create wealth-manager-db \
  --database-version POSTGRES_15 \
  --region us-central1 \
  --tier db-f1-micro

# Create database
gcloud sql databases create wealth_manager \
  --instance wealth-manager-db

# Create user
gcloud sql users create wealth_user \
  --instance wealth-manager-db \
  --password wealth_password
```

### 4. Configure Secret Manager
```bash
# Store sensitive data
echo -n "postgresql://..." | gcloud secrets create DATABASE_URL --data-file=-
echo -n "your-secret-key" | gcloud secrets create SECRET_KEY --data-file=-
echo -n "google-client-id" | gcloud secrets create GOOGLE_CLIENT_ID --data-file=-
echo -n "google-client-secret" | gcloud secrets create GOOGLE_CLIENT_SECRET --data-file=-
```

### 5. Deploy Backend
```bash
cd backend

# Build and push to Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/wealth-manager-backend

# Deploy to Cloud Run
gcloud run deploy wealth-manager-backend \
  --image gcr.io/YOUR_PROJECT_ID/wealth-manager-backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars "DATABASE_URL=postgresql://..." \
  --allow-unauthenticated
```

### 6. Deploy Frontend
```bash
cd frontend

# Update .env with backend API URL
echo "VITE_API_URL=https://YOUR_BACKEND_URL" > .env.production

# Build
npm run build

# Deploy to Cloud Run or Cloud Storage + Cloud CDN
gcloud run deploy wealth-manager-frontend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### 7. Configure Custom Domain
```bash
# Map custom domain to Cloud Run service
gcloud run services update wealth-manager-backend \
  --platform managed \
  --region us-central1 \
  --custom-domain-name api.yourdomain.com
```

---

## Environment Configuration

### Required Variables
```
DATABASE_URL              # PostgreSQL connection string
GOOGLE_CLIENT_ID          # From Google Cloud Console
GOOGLE_CLIENT_SECRET      # From Google Cloud Console
SECRET_KEY                # Random secret for JWT signing (generate with: openssl rand -hex 32)
```

### Optional Variables
```
SMTP_SERVER              # Email server (e.g., smtp.gmail.com)
SMTP_PORT                # Email port (usually 587)
SMTP_EMAIL               # Email address
SMTP_PASSWORD            # Email password or app token

REDIS_URL                # Redis connection string
ENVIRONMENT              # development | production
LOG_LEVEL                # DEBUG | INFO | WARNING | ERROR
```

### Development vs Production
```bash
# Development
ENV=development
DEBUG=true
LOG_LEVEL=DEBUG

# Production
ENV=production
DEBUG=false
LOG_LEVEL=WARNING
SECURE_SSL_REDIRECT=true
ALLOWED_HOSTS=yourdomain.com
```

---

## Database Setup

### 1. Create Database
```sql
CREATE DATABASE wealth_manager;
CREATE USER wealth_user WITH PASSWORD 'wealth_password';
ALTER ROLE wealth_user SET client_encoding TO 'utf8';
ALTER ROLE wealth_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE wealth_user SET default_transaction_deferrable TO on;
GRANT ALL PRIVILEGES ON DATABASE wealth_manager TO wealth_user;
```

### 2. Run Migrations (if using Alembic)
```bash
cd backend
alembic upgrade head
```

### 3. Verify Tables
```sql
\dt  # List all tables
\d users  # Describe users table
```

### 4. Backup Database
```bash
# Backup
pg_dump wealth_manager > backup.sql

# Restore
psql wealth_manager < backup.sql
```

---

## API Documentation

### Accessing Swagger UI
- **URL:** `http://localhost:8000/docs`
- **Alternative (ReDoc):** `http://localhost:8000/redoc`

### Key Endpoints

**Authentication:**
- `POST /auth/login` - Login with email/password
- `POST /auth/register` - Register new user
- `POST /auth/google` - Login with Google
- `POST /auth/refresh` - Refresh JWT token

**Recommendations:**
- `GET /recommendations/personalized/suggestions` - Get personalized suggestions
- `GET /recommendations/personalized/rebalancing` - Get rebalancing strategy

**Reports:**
- `GET /reports/comprehensive/export?format=pdf` - Export comprehensive report
- `GET /reports/portfolio/export?format=csv` - Export portfolio report

**Watchlist:**
- `GET /watchlist/all` - Get all watchlist items
- `POST /watchlist/add` - Add to watchlist
- `DELETE /watchlist/{id}` - Remove from watchlist

**Goals:**
- `GET /goals` - Get all goals
- `POST /goals` - Create new goal
- `PUT /goals/{id}` - Update goal

---

## Monitoring & Maintenance

### 1. Application Health Check
```bash
curl http://localhost:8000/health
```

### 2. View Logs
```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend

# System logs (Linux)
journalctl -u wealth-manager -f
```

### 3. Database Maintenance
```bash
# Backup database regularly
pg_dump wealth_manager > backup_$(date +%Y%m%d).sql

# Analyze query performance
EXPLAIN ANALYZE SELECT * FROM investments WHERE user_id = 1;
```

### 4. Performance Monitoring
- **Frontend:** Use browser DevTools Network tab
- **Backend:** Enable SQL logging: `ECHO=true sqlalchemy`
- **Database:** Monitor with pgAdmin or similar tools

### 5. Security Updates
```bash
# Update dependencies
pip install -U pip
pip install --upgrade -r requirements.txt

npm update
```

---

## Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
# Find and kill process
lsof -i :8000
kill -9 <PID>
```

**Database connection error:**
```bash
# Check PostgreSQL is running
psql -U wealth_user -d wealth_manager

# Verify DATABASE_URL in .env
echo $DATABASE_URL
```

**OAuth not working:**
- Verify Google Client ID and Secret in .env
- Check redirect URI in Google Cloud Console
- Ensure `GOOGLE_CLIENT_ID` matches frontend config

### Frontend Issues

**Port 3000 already in use:**
```bash
# Use different port
npm run dev -- --port 3001
```

**API not connecting:**
- Check backend is running: `curl http://localhost:8000/health`
- Verify `VITE_API_URL` in frontend .env
- Check CORS settings in backend

**Build errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Docker Issues

**Container won't start:**
```bash
# Check logs
docker-compose logs backend

# Remove and rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

**Database not initializing:**
```bash
# Manually create database
docker exec wealth-manager-db psql -U wealth_user -c "CREATE DATABASE wealth_manager"
```

---

## Performance Optimization

### Frontend Optimization
- Enable gzip compression in nginx
- Use CDN for static assets
- Implement code splitting with dynamic imports
- Lazy load components

### Backend Optimization
- Add database indexes on frequently queried columns
- Implement caching with Redis
- Use connection pooling
- Add query result caching

### Database Optimization
```sql
-- Create indexes
CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_watchlist_user_id ON watchlist(user_id);

-- Analyze performance
ANALYZE investments;
ANALYZE goals;
```

---

## Production Checklist

- [ ] Environment variables set correctly
- [ ] Database backups configured
- [ ] SSL/TLS certificates installed
- [ ] CORS settings configured
- [ ] Rate limiting enabled
- [ ] Input validation added
- [ ] Error logging configured
- [ ] Monitoring and alerting setup
- [ ] Database indexes created
- [ ] Security headers set
- [ ] HTTPS enforced
- [ ] Daily backups scheduled

---

## Support & Documentation

- **API Docs:** http://localhost:8000/docs
- **GitHub Issues:** Report bugs and features
- **Email:** support@wealthmanager.com

---

**Last Updated:** January 2026
**Version:** 1.0.0
