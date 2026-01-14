from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from decimal import Decimal

from ..database import get_db
from ..models import User, Goal, Investment, Transaction
from ..schemas import DashboardData
from ..auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/", response_model=DashboardData)
async def get_dashboard_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Calculate total portfolio value
    investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
    total_portfolio_value = sum(
        (inv.current_value or 0) for inv in investments
    ) if investments else Decimal('0')
    
    # Get goals statistics
    total_goals = db.query(Goal).filter(Goal.user_id == current_user.id).count()
    active_goals = db.query(Goal).filter(
        Goal.user_id == current_user.id,
        Goal.status == "Active"
    ).count()
    
    # Get investments count
    total_investments = len(investments)
    
    # Get recent transactions (last 5)
    recent_transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.created_at.desc()).limit(5).all()
    
    # Portfolio performance (simplified)
    portfolio_performance = {
        "total_value": float(total_portfolio_value),
        "daily_change": 0.0,  # Would calculate from price history
        "daily_change_percent": 0.0
    }
    
    return DashboardData(
        total_portfolio_value=total_portfolio_value,
        total_goals=total_goals,
        active_goals=active_goals,
        total_investments=total_investments,
        recent_transactions=recent_transactions,
        portfolio_performance=portfolio_performance
    )