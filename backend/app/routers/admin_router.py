from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
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
    clients = db.query(User).filter(User.role == "user")
    
    return {
        "total_users": clients.count(),
        "pending_kyc": clients.filter(User.kyc_status == "Pending").count(),
        # Sum of all investments
        "total_aum": db.query(func.sum(Investment.current_value)).scalar() or 0,
        
        # ⚠️ FIX IS HERE: Determine "Active" by math, not by a missing column
        "active_goals": db.query(Goal).filter(Goal.current_amount < Goal.target_amount).count()
    }

@router.get("/charts")
def get_admin_charts(db: Session = Depends(get_db), _=Depends(admin_required)):
    """
    Returns aggregated data for visualizations
    """
    # 1. Risk Profile Distribution
    risk_data = db.query(
        User.risk_profile, func.count(User.id)
    ).filter(User.role == 'user').group_by(User.risk_profile).all()
    
    # 2. Top Assets by Value
    asset_data = db.query(
        Investment.asset_name, func.sum(Investment.current_value)
    ).group_by(Investment.asset_name).order_by(func.sum(Investment.current_value).desc()).limit(5).all()

    return {
        "risk_distribution": [{"name": r[0] or "Unknown", "value": r[1]} for r in risk_data],
        "asset_allocation": [{"name": a[0], "value": a[1]} for a in asset_data]
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

@router.get("/users/{user_id}/full-data")
def get_user_full_data(user_id: int, db: Session = Depends(get_db), _=Depends(admin_required)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    investments = db.query(Investment).filter(Investment.user_id == user_id).all()
    goals = db.query(Goal).filter(Goal.user_id == user_id).all()
    
    return {
        "user": user,
        "investments": investments,
        "goals": goals
    }

@router.get("/users/pending")
def get_pending_kyc_users(db: Session = Depends(get_db), _=Depends(admin_required)):
    pending_users = db.query(User).filter(
        User.role == "user", 
        User.kyc_status.ilike("Pending")
    ).all()
    return pending_users