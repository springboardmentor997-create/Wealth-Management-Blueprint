from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from fastapi.security import OAuth2PasswordBearer
from datetime import timedelta
# UPDATED IMPORT: pointing to the specific file inside schemas folder
from app.schemas.user_schema import UserCreate, UserLogin, UserResponse 
from app.core.security import verify_password, create_access_token, get_password_hash

# Security libraries (Make sure to run: pip install python-jose passlib[bcrypt])
auth_router = APIRouter(prefix="/auth", tags=["Authentication"])

@auth_router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # 1. Check if email exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Hash the password
    hashed_pwd = get_password_hash(user.password)
    
    # 3. Create User with DEFAULTS
    # Since frontend doesn't send these, we create them ourselves:
    new_user = User(
        email=user.email,
        password=hashed_pwd,
        # Default Name: Use the part before '@' in email (e.g. "nakul")
        name=user.email.split("@")[0], 
        # Default Settings:
        risk_profile="moderate", 
        kyc_status="unverified"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@auth_router.post("/login")
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    # 1. Find User
    user = db.query(User).filter(User.email == user_credentials.email).first()

    # 2. Check Password SECURELY
    # We use 'verify_password' from our security.py file, not a method on the user
    if not user or not verify_password(user_credentials.password, user.password):
        raise HTTPException(status_code=403, detail="Invalid Credentials")

    # 3. Generate REAL Token
    # This creates the encrypted string that React needs to stay logged in
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {"access_token": access_token, "token_type": "bearer"}