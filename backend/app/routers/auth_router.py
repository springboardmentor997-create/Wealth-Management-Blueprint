from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
# UPDATED IMPORT: pointing to the specific file inside schemas folder
from app.schemas.user_schema import UserCreate, UserLogin, UserResponse 

# Security libraries (Make sure to run: pip install python-jose passlib[bcrypt])
# Note: For production, you need proper JWT handling. This is a simplified example.
auth_router = APIRouter(prefix="/auth", tags=["Authentication"])

@auth_router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # 1. Check if email exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Create User
    new_user = User(
        name=user.name,
        email=user.email,
        risk_profile=user.risk_profile,
        kyc_status=user.kyc_status
    )
    new_user.set_password(user.password)

    # 3. Save
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@auth_router.post("/login")
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    # 1. Find User
    user = db.query(User).filter(User.email == user_credentials.email).first()

    # 2. Check Password
    if not user or not user.check_password(user_credentials.password):
        raise HTTPException(status_code=403, detail="Invalid Credentials")

    # 3. Return Token (Placeholder)
    return {"access_token": f"fake-jwt-token-{user.id}", "token_type": "bearer"}