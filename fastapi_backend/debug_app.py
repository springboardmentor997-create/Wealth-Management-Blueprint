from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import Column, String, Integer, Float, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from pydantic import BaseModel, ValidationError
import uuid
import logging
import traceback

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Database setup
DATABASE_URL = "sqlite:///./debug_wealth.db"
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
SECRET_KEY = "debug-secret-key-change-in-production"
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_password_hash(password: str) -> str:
    try:
        return pwd_context.hash(password)
    except Exception as e:
        logger.error(f"Password hashing error: {e}")
        raise

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False

def create_access_token(data: dict):
    try:
        expire = datetime.utcnow() + timedelta(minutes=30)
        to_encode = data.copy()
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    except Exception as e:
        logger.error(f"Token creation error: {e}")
        raise

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError as e:
        logger.error(f"JWT error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")

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
app = FastAPI(title="Wealth Management API - Debug Version")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc),
            "path": str(request.url)
        }
    )

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.utcnow()
    
    # Log request
    body = await request.body()
    logger.info(f"Request: {request.method} {request.url}")
    logger.info(f"Headers: {dict(request.headers)}")
    if body:
        logger.info(f"Body: {body.decode()}")
    
    # Process request
    response = await call_next(request)
    
    # Log response
    process_time = (datetime.utcnow() - start_time).total_seconds()
    logger.info(f"Response: {response.status_code} in {process_time:.3f}s")
    
    return response

# Routes
@app.post("/api/auth/login")
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    try:
        logger.info(f"Login attempt for email: {login_data.email}")
        
        # Validate input
        if not login_data.email or not login_data.password:
            logger.warning("Missing email or password")
            raise HTTPException(status_code=400, detail="Email and password required")
        
        # Find user
        user = db.query(User).filter(User.email == login_data.email).first()
        if not user:
            logger.warning(f"User not found: {login_data.email}")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        logger.info(f"User found: {user.email}")
        
        # Verify password
        if not verify_password(login_data.password, user.password):
            logger.warning(f"Invalid password for user: {login_data.email}")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        logger.info("Password verified successfully")
        
        # Create token
        token = create_access_token({"sub": user.id, "email": user.email})
        logger.info("Token created successfully")
        
        response_data = {
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "is_admin": user.is_admin,
                "created_at": user.created_at
            },
            "token": token
        }
        
        logger.info("Login successful")
        return response_data
        
    except HTTPException:
        raise
    except ValidationError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=422, detail="Invalid input data")
    except Exception as e:
        logger.error(f"Login error: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@app.post("/api/auth/register")
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Registration attempt for email: {user_data.email}")
        
        existing = db.query(User).filter(User.email == user_data.email).first()
        if existing:
            logger.warning(f"Email already exists: {user_data.email}")
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
        
        logger.info(f"User registered successfully: {user_data.email}")
        return {"message": "User created successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.get("/api/goals/")
async def get_goals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
        return goals
    except Exception as e:
        logger.error(f"Get goals error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch goals")

@app.post("/api/goals/")
async def create_goal(goal_data: GoalCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
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
    except Exception as e:
        logger.error(f"Create goal error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create goal")

@app.delete("/api/goals/{goal_id}")
async def delete_goal(goal_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")
        db.delete(goal)
        db.commit()
        return {"message": "Goal deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete goal error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete goal")

@app.get("/")
async def root():
    return {"message": "Wealth Management API - Debug Version", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# Initialize admin user
def init_admin():
    try:
        db = SessionLocal()
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
            logger.info("Admin user created: admin@wealthapp.com / admin123")
        else:
            logger.info("Admin user already exists")
        db.close()
    except Exception as e:
        logger.error(f"Error creating admin: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")

# Create admin on startup
init_admin()