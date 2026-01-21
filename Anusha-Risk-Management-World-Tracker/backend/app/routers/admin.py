from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import func
import csv
import io
from pydantic import BaseModel

from app.database import get_db
from app import models
from app.auth import get_password_hash, verify_password, create_access_token, verify_token

router = APIRouter()

# Admin OAuth2 scheme
admin_oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/admin/login"
)

# Pydantic models
class AdminLogin(BaseModel):
    username: str
    password: str

class AdminUserResponse(BaseModel):
    id: int
    name: str
    email: str
    risk_profile: str
    kyc_status: str
    created_at: datetime
    total_investments: Optional[float] = None
    total_goals: Optional[int] = None
    total_transactions: Optional[int] = None

class AnalyticsResponse(BaseModel):
    total_users: int
    total_investments: float
    total_goals: int
    total_transactions: int
    users_by_risk_profile: dict
    kyc_verification_rate: float
    new_users_this_month: int

# Admin authentication
def authenticate_admin(db: Session, username: str, password: str) -> Optional[models.Admin]:
    admin = db.query(models.Admin).filter(models.Admin.username == username).first()
    if not admin:
        return None
    if not verify_password(password, admin.password):
        return None
    return admin

def get_current_admin(
    token: str = Depends(admin_oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.Admin:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired admin token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    username = verify_token(token, "access")
    if username is None:
        raise credentials_exception
    
    # Try to find admin by email first, then by username
    admin = db.query(models.Admin).filter(models.Admin.email == username).first()
    if not admin:
        admin = db.query(models.Admin).filter(models.Admin.username == username).first()
    
    if admin is None:
        raise credentials_exception
    
    return admin

# Routes
@router.post("/login")
def admin_login(admin_data: AdminLogin, db: Session = Depends(get_db)):
    admin = authenticate_admin(db, admin_data.username, admin_data.password)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )
    
    # Use admin email for token subject (more consistent)
    access_token = create_access_token(subject=admin.email)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users", response_model=List[AdminUserResponse])
def get_all_users(
    current_admin: models.Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    users = db.query(models.User).all()
    
    user_details = []
    for user in users:
        # Get user statistics
        total_investments = db.query(func.coalesce(func.sum(models.Investment.current_value), 0)).filter(
            models.Investment.user_id == user.id
        ).scalar()
        
        total_goals = db.query(models.Goal).filter(models.Goal.user_id == user.id).count()
        total_transactions = db.query(models.Transaction).filter(models.Transaction.user_id == user.id).count()
        
        user_details.append(AdminUserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            risk_profile=user.risk_profile.value if user.risk_profile else "unknown",
            kyc_status=user.kyc_status.value if user.kyc_status else "unknown",
            created_at=user.created_at,
            total_investments=float(total_investments) if total_investments else 0,
            total_goals=total_goals,
            total_transactions=total_transactions
        ))
    
    return user_details

@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(
    current_admin: models.Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # Total users
    total_users = db.query(models.User).count()
    
    # Total investments
    total_investments = db.query(func.coalesce(func.sum(models.Investment.current_value), 0)).scalar() or 0
    
    # Total goals
    total_goals = db.query(models.Goal).count()
    
    # Total transactions
    total_transactions = db.query(models.Transaction).count()
    
    # Users by risk profile
    users_by_risk_profile = db.query(
        models.User.risk_profile,
        func.count(models.User.id)
    ).group_by(models.User.risk_profile).all()
    
    risk_profile_dict = {profile.value: count for profile, count in users_by_risk_profile}
    
    # KYC verification rate
    verified_users = db.query(models.User).filter(models.User.kyc_status == 'verified').count()
    kyc_verification_rate = (verified_users / total_users * 100) if total_users > 0 else 0
    
    # New users this month
    current_month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    new_users_this_month = db.query(models.User).filter(
        models.User.created_at >= current_month_start
    ).count()
    
    return AnalyticsResponse(
        total_users=total_users,
        total_investments=float(total_investments),
        total_goals=total_goals,
        total_transactions=total_transactions,
        users_by_risk_profile=risk_profile_dict,
        kyc_verification_rate=kyc_verification_rate,
        new_users_this_month=new_users_this_month
    )

@router.get("/download/users")
def download_users(
    current_admin: models.Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    users = db.query(models.User).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(['ID', 'Name', 'Email', 'Risk Profile', 'KYC Status', 'Created At', 'Total Goals', 'Total Transactions'])
    
    # Data
    for user in users:
        total_goals = db.query(models.Goal).filter(models.Goal.user_id == user.id).count()
        total_transactions = db.query(models.Transaction).filter(models.Transaction.user_id == user.id).count()
        
        writer.writerow([
            user.id,
            user.name,
            user.email,
            user.risk_profile.value if user.risk_profile else 'unknown',
            user.kyc_status.value if user.kyc_status else 'unknown',
            user.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            total_goals,
            total_transactions
        ])
    
    output.seek(0)
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=users_data.csv"}
    )

@router.get("/download/analytics")
def download_analytics(
    current_admin: models.Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    analytics = get_analytics(current_admin, db)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(['Metric', 'Value'])
    
    # Data
    writer.writerow(['Total Users', analytics.total_users])
    writer.writerow(['Total Investments', f"${analytics.total_investments:,.2f}"])
    writer.writerow(['Total Goals', analytics.total_goals])
    writer.writerow(['Total Transactions', analytics.total_transactions])
    writer.writerow(['KYC Verification Rate (%)', f"{analytics.kyc_verification_rate:.2f}"])
    writer.writerow(['New Users This Month', analytics.new_users_this_month])
    
    # Risk profile breakdown
    writer.writerow([])
    writer.writerow(['Risk Profile Breakdown'])
    for profile, count in analytics.users_by_risk_profile.items():
        writer.writerow([profile, count])
    
    output.seek(0)
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=analytics_data.csv"}
    )

# Create default admin if not exists
def create_default_admin(db: Session):
    admin = db.query(models.Admin).filter(models.Admin.username == "admin").first()
    if not admin:
        default_admin = models.Admin(
            username="admin",
            email="admin@wealthmanagement.com",
            password=get_password_hash("admin123")
        )
        db.add(default_admin)
        db.commit()
        print("✅ Default admin created: username=admin, password=admin123")
