import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles # 👈 Added for serving frontend
from fastapi.responses import FileResponse  # 👈 Added for serving frontend

from app.core.database import engine, Base
from app.models import user as user_model
from app.routers import (
    auth_router, 
    user_router, 
    portfolio_router, 
    goals_router, 
    transaction_router, 
    reports_router, 
    recommendations_router, 
    admin_router
)

# 1. Create the Database Tables
user_model.Base.metadata.create_all(bind=engine)

app = FastAPI(title="WealthPlan API")

# ==========================================
# 2. 🛡️ ROBUST CORS SETTINGS (The Fix)
# ==========================================
app.add_middleware(
    CORSMiddleware,
    # 🚨 allow_origins=["*"] allows Netlify, Vercel, and localhost to connect.
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  # Allow GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],  # Allow all headers (Auth tokens, etc.)
)

# 3. Connect the Routers
app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(portfolio_router.router)
app.include_router(goals_router.router)
app.include_router(transaction_router.router)
app.include_router(reports_router.router)
app.include_router(recommendations_router.router)
app.include_router(admin_router.router)

# ==========================================
# 4. 🚀 FRONTEND SERVING (The "Monolith" Setup)
# ==========================================
# This logic checks if you have put your React 'dist' files into 'app/static'.
# If you have, it serves them. If not, it safely ignores them.

# Find the 'static' folder relative to this file
static_dir = os.path.join(os.path.dirname(__file__), "static")

if os.path.exists(static_dir):
    # Serve "assets" (CSS, JS, Images) from the React build
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

    # Serve the React 'index.html' for any other path (handling React Router)
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        # Don't intercept API calls!
        if full_path.startswith("api") or full_path.startswith("auth") or full_path.startswith("docs"):
            return {"error": "API route not found"}
        
        # Return the React app
        return FileResponse(os.path.join(static_dir, "index.html"))

else:
    # Fallback if no frontend is found (Normal API mode)
    @app.get("/")
    def read_root():
        return {"message": "WealthPlan API is running! (Frontend not served locally)"}