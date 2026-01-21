from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import Response, FileResponse  # 👈 Added FileResponse
import os
from pathlib import Path  # 👈 Added for robust path finding
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

# --- 1. SETUP PATHS ---
# This finds the absolute path to your 'app' folder
BASE_DIR = Path(__file__).resolve().parent
# This points to 'app/static'
STATIC_DIR = BASE_DIR / "static"

# Favicon endpoint to prevent 404
@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(content="", media_type="image/x-icon")

# CORS middleware
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
    "https://wealth-management-blueprint-1.onrender.com" # Added your production URL
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

# Mount user uploads (Keep your existing static mount)
app.mount("/static", StaticFiles(directory="uploads"), name="static")

# --- 2. MOUNT FRONTEND ASSETS ---
# This serves the JS and CSS files from 'app/static/assets'
# We use try/except in case the folder doesn't exist locally yet
assets_path = STATIC_DIR / "assets"
if assets_path.exists():
    app.mount("/assets", StaticFiles(directory=str(assets_path)), name="assets")

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

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# --- 3. THE CATCH-ALL ROUTE (MUST BE LAST) ---
# This replaces your old "/" endpoint.
# It serves index.html for the root URL and any other URL not matched above (like /dashboard)
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    # Security: check if they are asking for a specific file that actually exists inside static
    target_file = STATIC_DIR / full_path
    if target_file.exists() and target_file.is_file():
        return FileResponse(target_file)
    
    # If not, give them the React App entry point
    return FileResponse(STATIC_DIR / "index.html")