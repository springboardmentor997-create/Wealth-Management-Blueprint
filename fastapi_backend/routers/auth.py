from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid
import shutil
import os

from database import get_db
from models import User
from schemas import UserCreate, UserLogin, AuthResponse, User as UserSchema, UserUpdate, RefreshTokenRequest, UserPasswordUpdate
from auth import get_password_hash, verify_password, create_access_token, create_refresh_token, verify_refresh_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["authentication"])

@router.post("/register")
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    try:
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed_password = get_password_hash(user_data.password)
        user_id = str(uuid.uuid4())
        
        user = User(
            id=user_id,
            name=user_data.name,
            email=user_data.email,
            password=hashed_password,
            risk_profile=user_data.risk_profile or "moderate",
            kyc_status="unverified",
            is_admin="false",
            login_count=0
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return {"message": "Account created successfully! Please login to continue."}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/token", response_model=AuthResponse)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == form_data.username).first()
        if not user:
            raise HTTPException(status_code=400, detail="Incorrect email or password")
        
        if not verify_password(form_data.password, user.password):
            raise HTTPException(status_code=400, detail="Incorrect email or password")
            
        # Update login tracking
        user.last_login = datetime.utcnow()
        user.login_count = (user.login_count or 0) + 1
        db.commit()
        
        token_data = {"sub": str(user.id), "email": user.email}
        token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        return AuthResponse(
            user=UserSchema.from_orm(user),
            token=token,
            refresh_token=refresh_token
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@router.post("/login", response_model=AuthResponse)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == login_data.email).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found. Please register first.")
        
        if not verify_password(login_data.password, user.password):
            raise HTTPException(status_code=401, detail="Invalid password")
        
        # Update login tracking
        user.last_login = datetime.utcnow()
        user.login_count = (user.login_count or 0) + 1
        db.commit()
        
        token_data = {"sub": str(user.id), "email": user.email}
        token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        return AuthResponse(
            user=UserSchema.from_orm(user),
            token=token,
            refresh_token=refresh_token
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@router.post("/refresh")
async def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Refresh access token using a valid refresh token.
    """
    try:
        token_data = verify_refresh_token(request.refresh_token)
        if not token_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        user = db.query(User).filter(User.id == token_data["user_id"]).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        # Create new access token
        new_token_data = {"sub": str(user.id), "email": user.email}
        new_access_token = create_access_token(new_token_data)
        
        return {"token": new_access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Token refresh failed: {str(e)}")

@router.get("/me", response_model=UserSchema)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserSchema.from_orm(current_user)

@router.put("/profile", response_model=UserSchema)
async def update_profile(user_data: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        if user_data.name:
            current_user.name = user_data.name
        if user_data.email:
            # Check if email is taken by another user
            existing_user = db.query(User).filter(User.email == user_data.email).first()
            if existing_user and existing_user.id != current_user.id:
                raise HTTPException(status_code=400, detail="Email already registered")
            current_user.email = user_data.email
        if user_data.risk_profile:
            current_user.risk_profile = user_data.risk_profile
        if user_data.kyc_status:
            current_user.kyc_status = user_data.kyc_status
            
        db.commit()
        db.refresh(current_user)
        return UserSchema.from_orm(current_user)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")

@router.put("/password")
async def change_password(
    password_data: UserPasswordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Verify current password
        if not verify_password(password_data.current_password, current_user.password):
            raise HTTPException(status_code=400, detail="Incorrect current password")
            
        # Update with new password
        current_user.password = get_password_hash(password_data.new_password)
        
        db.commit()
        
        return {"message": "Password updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update password: {str(e)}")

@router.post("/profile/image", response_model=UserSchema)
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Create directory if it doesn't exist
        upload_dir = "uploads/profile_pictures"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        filename = f"{current_user.id}_{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Update user profile
        # Store relative path that can be served
        relative_path = f"/static/profile_pictures/{filename}"
        current_user.profile_picture = relative_path
        
        db.commit()
        db.refresh(current_user)
        
        return UserSchema.from_orm(current_user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

        raise HTTPException(status_code=500, detail=f"Profile update failed: {str(e)}")
