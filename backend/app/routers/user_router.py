from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db 
from app.core.security import get_current_user
from app import models, schemas
from app.schemas.user_schema import UserOut, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])

# 1. PROFILE ENDPOINT (Keep as is)
@router.get("/me", response_model=schemas.user_schema.UserOut)
def read_users_me(current_user: models.user.User = Depends(get_current_user)):
    return current_user

# 2. ADMIN ENDPOINT (Secured)
@router.get("/all", response_model=List[schemas.user_schema.UserOut])
def get_all_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    current_user: models.user.User = Depends(get_current_user)
):
    # 🔒 RBAC CHECK: If user is not admin, kick them out
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="You do not have admin privileges"
        )
        
    users = db.query(models.user.User).offset(skip).limit(limit).all()
    return users

@router.put("/me", response_model=UserOut)
def update_user_profile(
    user_update: UserUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.user.User = Depends(get_current_user)
):
    # Update fields only if provided
    if user_update.name:
        current_user.name = user_update.name
    if user_update.phone:
        current_user.phone = user_update.phone
    if user_update.risk_profile:
        current_user.risk_profile = user_update.risk_profile
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/me/request-kyc")
def request_kyc(
    db: Session = Depends(get_db), 
    current_user: models.user.User = Depends(get_current_user)
):
    current_user.kyc_status = "Pending"
    db.commit()
    return {"status": "KYC verification requested"}