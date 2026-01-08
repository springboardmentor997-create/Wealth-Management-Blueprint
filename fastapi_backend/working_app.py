from fastapi import FastAPI, Depends, HTTPException, Request, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import Column, String, Integer, Float, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from pydantic import BaseModel, validator
import uuid
import logging
import os
import shutil

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database
DATABASE_URL = "sqlite:///./working_wealth.db"
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
    profile_picture = Column(String, nullable=True)
    risk_profile = Column(String, default="moderate")
    kyc_status = Column(String, default="unverified")
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

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String, primary_key=True)
    user_id = Column(String)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, default="info")
    is_read = Column(String, default="false")
    created_at = Column(String)

Base.metadata.create_all(bind=engine)

# Auth
SECRET_KEY = "working-secret-key"
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
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
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

class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str

    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class GoalCreate(BaseModel):
    title: str
    goal_type: str
    target_amount: float
    current_amount: float = 0
    monthly_contribution: float
    target_date: str

class NotificationSchema(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str
    is_read: str
    created_at: str

# App
app = FastAPI(title="Wealth Management API")

# Create uploads directory
os.makedirs("uploads/profile_pictures", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

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
    logger.info(f"Login attempt: {login_data.email}")
    
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user:
        logger.warning(f"User not found: {login_data.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(login_data.password, user.password):
        logger.warning(f"Invalid password: {login_data.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user.id, "email": user.email})
    logger.info(f"Login successful: {login_data.email}")
    
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

@app.put("/api/auth/password")
async def update_password(update: UserPasswordUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(update.current_password, current_user.password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    current_user.password = get_password_hash(update.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

@app.post("/api/auth/profile/image")
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Create unique filename
        file_extension = os.path.splitext(file.filename)[1]
        filename = f"{current_user.id}_{uuid.uuid4()}{file_extension}"
        file_path = f"uploads/profile_pictures/{filename}"
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Update user profile
        # Note: We store the path starting with /uploads so frontend can access it
        relative_path = f"/uploads/profile_pictures/{filename}"
        current_user.profile_picture = relative_path
        db.commit()
        db.refresh(current_user)
        
        return {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "is_admin": current_user.is_admin,
            "profile_picture": current_user.profile_picture,
            "risk_profile": current_user.risk_profile,
            "kyc_status": current_user.kyc_status,
            "created_at": current_user.created_at
        }
    except Exception as e:
        logger.error(f"Image upload failed: {e}")
        raise HTTPException(status_code=500, detail="Image upload failed")

@app.put("/api/auth/profile")
async def update_profile(
    updates: dict,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    try:
        if "name" in updates:
            current_user.name = updates["name"]
        if "email" in updates:
            current_user.email = updates["email"]
        if "risk_profile" in updates:
            current_user.risk_profile = updates["risk_profile"]
            
        db.commit()
        db.refresh(current_user)
        
        return {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "is_admin": current_user.is_admin,
            "profile_picture": current_user.profile_picture,
            "risk_profile": current_user.risk_profile,
            "kyc_status": current_user.kyc_status,
            "created_at": current_user.created_at
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "is_admin": current_user.is_admin,
        "profile_picture": current_user.profile_picture,
        "risk_profile": current_user.risk_profile,
        "kyc_status": current_user.kyc_status,
        "created_at": current_user.created_at
    }

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

@app.put("/api/goals/{goal_id}")
async def update_goal(goal_id: str, goal_data: GoalCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    goal.title = goal_data.title
    goal.goal_type = goal_data.goal_type
    goal.target_amount = goal_data.target_amount
    goal.current_amount = goal_data.current_amount
    goal.monthly_contribution = goal_data.monthly_contribution
    goal.target_date = goal_data.target_date
    goal.updated_at = datetime.utcnow().isoformat()
    
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

@app.get("/notifications/")
async def get_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Return all notifications for the user, sorted by date DESC
    # We will filter on frontend, or you can filter here .filter(Notification.is_read == "false")
    notifications = db.query(Notification)\
        .filter(Notification.user_id == current_user.id)\
        .order_by(Notification.created_at.desc())\
        .all()
    return notifications

@app.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notification.is_read = "true"
    db.commit()
    return notification

@app.get("/")
async def root():
    return {"message": "Wealth Management API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

# Create admin user
def create_admin():
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
            logger.info("Admin created: admin@wealthapp.com / admin123")
    except Exception as e:
        logger.error(f"Admin creation error: {e}")
    finally:
        db.close()

create_admin()