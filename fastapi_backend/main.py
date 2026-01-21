from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import Response
import os
import sys

# Add the current directory to path for imports to work on Render
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models import Base
from database import engine
from routers import auth, goals, investments, transactions, portfolio, simulations, recommendations, reports, market, admin, calculators, dashboard, notifications, kyc

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Wealth Management API",
    description="FastAPI backend for wealth management application",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Favicon endpoint to prevent 404
@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(content="", media_type="image/x-icon")

# CORS middleware - ADD THIS FIRST, before everything else
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="uploads"), name="static")

# Include routers
app.include_router(auth.router, prefix="/api/auth")
app.include_router(kyc.router)
app.include_router(goals.router)
app.include_router(investments.router)
app.include_router(transactions.router)
app.include_router(portfolio.router)
app.include_router(simulations.router)
app.include_router(recommendations.router)
app.include_router(reports.router)
app.include_router(market.router)
app.include_router(admin.router)
app.include_router(calculators.router)
app.include_router(dashboard.router)
app.include_router(notifications.router)

@app.get("/")
async def root():
    return {"message": "Wealth Management API", "status": "running", "docs": "/docs"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
