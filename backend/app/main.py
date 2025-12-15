from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.routers import auth_router, user_router 

# Create Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Wealth Management API")

# Setup CORS (Allows Frontend to talk to Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- VITAL: Connect the routers ---
# This looks inside auth_router.py for a variable named 'router'
app.include_router(auth_router.router)
app.include_router(user_router.router)