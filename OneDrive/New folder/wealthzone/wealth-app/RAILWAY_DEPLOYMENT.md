# Railway Deployment Guide for Wealth Management App

## 📋 Prerequisites

- GitHub account with your code pushed
- Railway account (free at https://railway.app)
- PostgreSQL database
- Necessary API keys (Alpha Vantage, Finnhub, NewsAPI)

## 🚀 Step-by-Step Deployment

### Step 1: Set Up PostgreSQL Database on Railway

1. Go to https://railway.app and sign in with GitHub
2. Create a new project
3. Click "Add Service" → Select "PostgreSQL"
4. Railway will automatically provision a PostgreSQL database
5. Copy the database credentials from the Railway dashboard

### Step 2: Connect Your GitHub Repository

1. In your Railway project, click "New Service"
2. Select "GitHub Repo"
3. Authorize Railway to access your GitHub
4. Select repository: `springboardmentor997-create/Wealth-Management-Blueprint`
5. Select branch: `Dilip-wealthzone`

### Step 3: Configure Environment Variables

1. In Railway, go to **Variables** tab of your app service
2. Add the following variables:

```
# Database (Railway auto-provides DATABASE_URL from PostgreSQL plugin)
DATABASE_URL=postgresql://[Railway auto-filled]

# API Configuration
API_ENV=production
DEBUG=False

# Security (CHANGE THESE!)
SECRET_KEY=[Generate a strong random key]
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend URL
FRONTEND_URL=https://[your-railway-domain].railway.app
ALLOWED_ORIGINS=https://[your-railway-domain].railway.app

# API Keys (Get from respective services)
ALPHA_VANTAGE_KEY=your_key
FINNHUB_KEY=your_key
NEWSAPI_KEY=your_key
```

### Step 4: Deploy

1. Railway automatically detects the Dockerfile
2. Click "Deploy" - it will start building
3. Wait for the build to complete (5-10 minutes)
4. Once deployed, Railway provides a public URL

### Step 5: Verify Deployment

1. Visit: `https://[your-railway-domain].railway.app/docs` (Swagger UI)
2. Check API endpoints are working
3. Database should be connected automatically

## 📝 Important Files

- **Dockerfile** - Builds both frontend and backend in one container
- **railway.json** - Railway-specific configuration
- **.env.railway** - Environment variables template

## 🔐 Security Notes

1. **Never commit .env files** - Use Railway dashboard for sensitive data
2. **Change SECRET_KEY** - Generate strong random key for production
3. **Enable HTTPS** - Railway provides SSL by default
4. **API Rate Limiting** - Configure in main.py for production

## ⚙️ Database Migrations

Migrations run automatically on first deployment. To manually run:

1. Go to Railway console
2. Run: `python -m alembic upgrade head`

## 🐛 Troubleshooting

### App crashes on startup
- Check logs in Railway dashboard
- Verify DATABASE_URL is set
- Check if migrations ran successfully

### Database connection refused
- Ensure PostgreSQL service is running in Railway
- Check DATABASE_URL format
- Verify credentials in variables

### Frontend not loading
- Check if dist folder was built
- Verify FRONTEND_URL in variables
- Clear browser cache

## 📊 Monitoring

- View logs: Click service → "Logs" tab
- Monitor resources: "Metrics" tab
- Check deployments: "Deployments" tab

## 🆘 Need Help?

- Railway Docs: https://docs.railway.app
- GitHub Issues: https://github.com/springboardmentor997-create/Wealth-Management-Blueprint
