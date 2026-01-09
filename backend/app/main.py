from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.models import user as user_model # Import models so the DB knows what to create
from app.models import User, Investment
from app.routers import auth_router, user_router,portfolio_router ,goals_router , transaction_router , reports_router , recommendations_router , admin_router

# 1. Create the Database Tables
# This line checks if 'wealth.db' exists. If not, it creates it!
user_model.Base.metadata.create_all(bind=engine)

app = FastAPI(title="WealthPlan API")

# 2. CORS Settings (Allow Frontend to talk to Backend)
origins = [
    "http://localhost:5173", # Your React Frontend
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Connect the Routers (The "Doors" to your app)
app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(portfolio_router.router)
app.include_router(goals_router.router)
app.include_router(transaction_router.router)
app.include_router(reports_router.router)
app.include_router(recommendations_router.router)
app.include_router(admin_router.router)

@app.get("/")
def read_root():
    return {"message": "WealthPlan API is running!"}