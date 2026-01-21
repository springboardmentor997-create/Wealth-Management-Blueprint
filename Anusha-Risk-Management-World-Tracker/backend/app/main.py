import os
from fastapi import FastAPI # pyright: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware # pyright: ignore[reportMissingImports]

from app.database import engine, Base
from app.routers import (
    auth,
    users,
    goals,
    investments,
    transactions,
    simulations,
    recommendations,
    reports,
    admin
)

print("🔥 MAIN FILE RUNNING FROM:", os.path.abspath(__file__))

app = FastAPI(
    title="Wealth Management & Goal Tracker API",
    description="Digital wealth management platform API",
    version="1.0.0"
)

# ✅ CORS MUST COME FIRST
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        "http://localhost:3003",
        "http://127.0.0.1:3003",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ DB AFTER CORS
Base.metadata.create_all(bind=engine)

# Create default admin user
from app.database import get_db
from app.routers.admin import create_default_admin

# Create admin on startup
def create_admin_on_startup():
    db = next(get_db())
    try:
        create_default_admin(db)
    except Exception as e:
        print(f"Error creating admin: {e}")
    finally:
        db.close()

create_admin_on_startup()

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(goals.router, prefix="/api/goals", tags=["goals"])
app.include_router(investments.router, prefix="/api/investments", tags=["investments"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["transactions"])
app.include_router(simulations.router, prefix="/api/simulations", tags=["simulations"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

@app.get("/")
def root():
    return {"message": "Wealth Management & Goal Tracker API"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
