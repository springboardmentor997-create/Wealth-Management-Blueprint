from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import Investment, User
from schemas import PortfolioSummary
from auth import get_current_user
from market_service import MarketDataService

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])

@router.get("/history")
async def get_portfolio_history(period: str = "6mo", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
    
    if not investments:
        # Return empty generic data for chart to handle gracefully or flat line
        return []
        
    history = MarketDataService.get_portfolio_history(investments, period)
    return history

@router.get("/summary", response_model=PortfolioSummary)
async def get_portfolio_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
    
    total_value = sum(float(inv.current_value or 0) for inv in investments)
    total_cost_basis = sum(float(inv.cost_basis or 0) for inv in investments)
    total_gain_loss = total_value - total_cost_basis
    monthly_growth_percentage = 2.5 if total_value > 0 else 0
    
    return PortfolioSummary(
        total_value=total_value,
        total_cost_basis=total_cost_basis,
        total_gain_loss=total_gain_loss,
        monthly_growth_percentage=monthly_growth_percentage
    )