from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Column, String, Integer, Float, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from pydantic import BaseModel
import uuid
import os

# Database setup
DATABASE_URL = "sqlite:///./simple_wealth.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    is_admin = Column(String, default="false")
    created_at = Column(String)

class Goal(Base):
    __tablename__ = "goals"
    
    id = Column(String, primary_key=True)
    user_id = Column(String)
    title = Column(String, nullable=False)
    goal_type = Column(String, nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0)
    monthly_contribution = Column(Float, nullable=False)
    target_date = Column(String, nullable=False)
    status = Column(String, default="active")
    created_at = Column(String)
    updated_at = Column(String)

# Create tables
Base.metadata.create_all(bind=engine)

# Auth setup
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

# Schemas
class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class GoalCreate(BaseModel):
    title: str
    goal_type: str
    target_amount: float
    current_amount: float = 0
    monthly_contribution: float
    target_date: str

# FastAPI app
app = FastAPI(title="Wealth Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
@app.post("/api/auth/login")
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == login_data.email).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        if not verify_password(login_data.password, user.password):
            raise HTTPException(status_code=401, detail="Invalid password")
        
        token = create_access_token({"sub": user.id, "email": user.email})
        return {
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "is_admin": user.is_admin,
                "created_at": user.created_at
            },
            "token": token
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

@app.post("/api/auth/register")
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        id=str(uuid.uuid4()),
        name=user_data.name,
        email=user_data.email,
        password=get_password_hash(user_data.password),
        created_at=datetime.utcnow().isoformat()
    )
    db.add(user)
    db.commit()
    return {"message": "User created successfully"}

@app.get("/api/goals/")
async def get_goals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    return goals

@app.post("/api/goals/")
async def create_goal(goal_data: GoalCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = Goal(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        title=goal_data.title,
        goal_type=goal_data.goal_type,
        target_amount=goal_data.target_amount,
        current_amount=goal_data.current_amount,
        monthly_contribution=goal_data.monthly_contribution,
        target_date=goal_data.target_date,
        created_at=datetime.utcnow().isoformat(),
        updated_at=datetime.utcnow().isoformat()
    )
    db.add(goal)
    db.commit()
    return goal

@app.delete("/api/goals/{goal_id}")
async def delete_goal(goal_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()
    return {"message": "Goal deleted"}

@app.get("/")
async def root():
    return {"message": "Wealth Management API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

# Initialize admin user
def init_admin():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@wealthapp.com").first()
        if not admin:
            admin = User(
                id=str(uuid.uuid4()),
                name="Admin User",
                email="admin@wealthapp.com",
                password=get_password_hash("admin123"),
                is_admin="true",
                created_at=datetime.utcnow().isoformat()
            )
            db.add(admin)
            db.commit()
            print("Admin user created: admin@wealthapp.com / admin123")
        else:
            print("Admin user already exists")
    except Exception as e:
        print(f"Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()

# Create admin on startup
try:
    init_admin()
except Exception as e:
    print(f"Startup error: {e}")