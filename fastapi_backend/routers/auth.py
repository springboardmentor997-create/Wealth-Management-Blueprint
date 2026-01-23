from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid
import shutil
import os
import time
import logging
import base64

from database import get_db
from models import User
from schemas import UserCreate, UserLogin, AuthResponse, User as UserSchema, UserUpdate, RefreshTokenRequest, UserPasswordUpdate
from auth import get_password_hash, verify_password, create_access_token, create_refresh_token, verify_refresh_token, get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(tags=["authentication"])

@router.post("/register")
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    try:
        logger.info("[REGISTER] Entered register endpoint")
        logger.info(f"[REGISTER] Email: {user_data.email}, Name: {user_data.name}")
        
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            logger.warning(f"[REGISTER] Email already registered: {user_data.email}")
            raise HTTPException(status_code=400, detail="Email already registered")

        # Debug print for password
        logger.info(f"[REGISTER] Received password (length: {len(user_data.password)})")

        try:
            hashed_password = get_password_hash(user_data.password)
        except ValueError as ve:
            logger.error(f"[REGISTER] ValueError in get_password_hash: {ve}")
            raise HTTPException(status_code=400, detail=str(ve))
        
        user_id = str(uuid.uuid4())
        logger.info(f"[REGISTER] Created user ID: {user_id}")

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

        logger.info(f"[REGISTER] Adding user to database...")
        db.add(user)
        logger.info(f"[REGISTER] Committing transaction...")
        db.commit()
        logger.info(f"[REGISTER] Refresh user object...")
        db.refresh(user)

        logger.info(f"[REGISTER] ✅ User created successfully: {user.email}")
        return {"message": "Account created successfully! Please login to continue."}
    except HTTPException:
        logger.error(f"[REGISTER] HTTPException raised")
        raise
    except Exception as e:
        logger.error(f"[REGISTER] ❌ Exception in register: {e}", exc_info=True)
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
        start_time = time.time()
        
        # Query user
        query_start = time.time()
        user = db.query(User).filter(User.email == login_data.email).first()
        query_time = time.time() - query_start
        logger.info(f"User query took {query_time:.3f}s for email: {login_data.email}")
        
        if not user:
            logger.warning(f"Login attempt failed: User not found for email: {login_data.email}")
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Verify password
        try:
            pwd_start = time.time()
            is_valid = verify_password(login_data.password, user.password)
            pwd_time = time.time() - pwd_start
            logger.info(f"Password verification took {pwd_time:.3f}s, result: {is_valid}")
            
            if not is_valid:
                logger.warning(f"Login attempt failed: Invalid password for email: {login_data.email}")
                raise HTTPException(status_code=401, detail="Invalid email or password")
        except ValueError as ve:
            logger.error(f"Password verification error: {str(ve)}")
            raise HTTPException(status_code=400, detail=str(ve))
        
        # Update login tracking
        update_start = time.time()
        user.last_login = datetime.utcnow()
        user.login_count = (user.login_count or 0) + 1
        db.commit()
        update_time = time.time() - update_start
        logger.info(f"Login tracking update took {update_time:.3f}s")
        
        # Generate tokens
        token_start = time.time()
        token_data = {"sub": str(user.id), "email": user.email}
        token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        token_time = time.time() - token_start
        logger.info(f"Token generation took {token_time:.3f}s")
        
        total_time = time.time() - start_time
        logger.info(f"Total login endpoint time: {total_time:.3f}s")
        
        return AuthResponse(
            user=UserSchema.from_orm(user),
            token=token,
            refresh_token=refresh_token
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed: {str(e)}", exc_info=True)
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
        # Validate file type
        allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.")
        
        # Read file content and convert to Base64
        file_content = await file.read()
        
        # Limit file size (e.g., 2MB)
        max_size = 2 * 1024 * 1024  # 2MB
        if len(file_content) > max_size:
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 2MB.")
        
        # Convert to Base64 data URI
        base64_encoded = base64.b64encode(file_content).decode('utf-8')
        data_uri = f"data:{file.content_type};base64,{base64_encoded}"
        
        # Store Base64 data URI in database
        current_user.profile_picture = data_uri
        
        db.commit()
        db.refresh(current_user)
        
        logger.info(f"User profile updated with Base64 image for user: {current_user.id}")
        return UserSchema.from_orm(current_user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Image upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

        raise HTTPException(status_code=500, detail=f"Profile update failed: {str(e)}")
