from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.investment import Investment
from app.models.goal import Goal
from app.schemas.user_schema import UserOut
from typing import List

router = APIRouter(prefix="/admin", tags=["admin"])

# Only Admins allowed
def admin_required(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return current_user

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db), _=Depends(admin_required)):
    # Total platform users (excluding other admins)
    clients = db.query(User).filter(User.role == "user")
    
    return {
        "total_users": clients.count(),
        "pending_kyc": clients.filter(User.kyc_status == "Pending").count(),
        "total_aum": sum(inv.current_value for inv in db.query(Investment).all()) or 0
    }

@router.get("/users", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db), _=Depends(admin_required)):
    return db.query(User).all()

@router.post("/users/{user_id}/approve-kyc")
def approve_kyc(user_id: int, db: Session = Depends(get_db), _=Depends(admin_required)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user: raise HTTPException(status_code=404)
    user.kyc_status = "Verified"
    db.commit()
    return {"msg": "User verified successfully"}

@router.get("/users/{user_id}/full-data") # 👈 Check for typos here
def get_user_full_data(user_id: int, db: Session = Depends(get_db), _=Depends(admin_required)):
    user = db.query(User).filter(User.id == user_id).first()
    
    # If the user doesn't exist in the DB, it will also return a 404
    if not user:
        raise HTTPException(status_code=404, detail="User not found in database")
    
    investments = db.query(Investment).filter(Investment.user_id == user_id).all()
    goals = db.query(Goal).filter(Goal.user_id == user_id).all()
    
    return {
        "user": user,
        "investments": investments,
        "goals": goals
    }

@router.get("/users/pending")
def get_pending_kyc_users(db: Session = Depends(get_db), _=Depends(admin_required)):
    # Use .ilike for case-insensitive matching to avoid ENUM errors
    pending_users = db.query(User).filter(
        User.role == "user", 
        User.kyc_status.ilike("Pending")
    ).all()
    return pending_users