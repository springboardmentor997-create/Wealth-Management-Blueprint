from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.database import create_db_and_tables
from routes.user_router import router as user_router
from routes.goals_router import router as goals_router
from routes.portfolio_router import router as portfolio_router
from routes.simulations_router import router as simulations_router
from routes.recommendations_router import router as recommendations_router
from routes.dashboard_routes import router as dashboard_router
from routes.report_routes import router as report_router
from routes.market import router as market_router
from routes.auth_router import router as auth_router
from routes.assessment_router import router as assessment_router
from routes.watchlist_router import router as watchlist_router

# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_db_and_tables()
    yield
    # Shutdown (if needed)

# Create FastAPI app with comprehensive documentation and lifespan
app = FastAPI(
    title="Wealth Manager API",
    description="A comprehensive personal wealth management platform with portfolio tracking, goal setting, and AI-powered recommendations.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(user_router)
app.include_router(goals_router)
app.include_router(portfolio_router)
app.include_router(simulations_router)
app.include_router(recommendations_router)
app.include_router(dashboard_router)
app.include_router(report_router)
app.include_router(market_router)
app.include_router(auth_router)
app.include_router(assessment_router)
app.include_router(watchlist_router)

@app.get("/")
def root():
    return {
        "status": "Wealth Manager Backend - Running Successfully",
        "docs": "http://localhost:8000/docs",
        "redoc": "http://localhost:8000/redoc",
        "openapi": "http://localhost:8000/openapi.json"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "wealth-manager-backend"}

# ===================== STATIC FILE SERVING (DEPLOYMENT) =====================
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Path to the frontend build directory
frontend_build_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")

if os.path.exists(frontend_build_dir):
    # Mount assets (JS/CSS/Images)
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_build_dir, "assets")), name="assets")

    # Catch-all route for SPA (React Router)
    # NOTE: This must be the LAST route defined to avoid overriding API endpoints
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Specific check to ensure we don't accidentally intercept API calls if they fail to match above
        if full_path.startswith("api"):
            return {"error": "API endpoint not found"}
            
        # Serve index.html for any other route (React handles routing)
        index_file = os.path.join(frontend_build_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"error": "Frontend build index.html not found"}
else:
    print(f"Warning: Frontend build directory not found at {frontend_build_dir}")
