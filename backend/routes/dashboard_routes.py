from fastapi import APIRouter, Depends, BackgroundTasks
from sqlmodel import Session, select
from core.database import get_session
from core.security import get_current_user
from models.user import User
from models.goal import Goal, GoalStatus
from models.investment import Investment

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def dashboard_summary(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    goals = session.exec(select(Goal).where(Goal.user_id == current_user.id)).all()
    investments = session.exec(select(Investment).where(Investment.user_id == current_user.id)).all()
    total_invested = sum((float(i.current_value) if i.current_value else 0) for i in investments)
    total_goals = len(goals)
    completed_goals = len([g for g in goals if g.status == GoalStatus.completed])

    return {
        "total_invested": float(total_invested),
        "total_goals": total_goals,
        "completed_goals": completed_goals,
        "goal_completion_rate": (
            (completed_goals / total_goals * 100) if total_goals else 0
        )
    }

@router.get("/investments")
def list_investments(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    investments = session.exec(select(Investment).where(Investment.user_id == current_user.id)).all()
    return investments

@router.get("/performance")
def performance_chart(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    investments = session.exec(select(Investment).where(Investment.user_id == current_user.id)).all()
    current_total = sum((float(i.current_value) if i.current_value else 0) for i in investments)
    
    # Since we don't have historical data table yet, we return current month only
    # preventing fake "trend" data.
    from datetime import datetime
    current_month = datetime.now().strftime("%b")
    
    return [
        {"month": current_month, "value": current_total}
    ]

@router.post("/sync-market")
def sync_market_data(background_tasks: BackgroundTasks, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    """Trigger background task to update market prices"""
    
    def update_prices_task(user_id: int):
        from core.database import engine
        from sqlmodel import Session, select
        from models.investment import Investment
        from services.market_service import get_stock
        import logging
        from datetime import datetime
        
        logger = logging.getLogger(__name__)
        
        # Create a new session for the background task
        with Session(engine) as db_session:
            investments = db_session.exec(select(Investment).where(Investment.user_id == user_id)).all()
            updated_count = 0
            
            for inv in investments:
                try:
                    # Fetch data
                    stock_data = get_stock(inv.symbol)
                    if stock_data and "price" in stock_data and stock_data["price"]:
                        new_price = float(stock_data["price"])
                        inv.last_price = new_price
                        inv.current_value = new_price * float(inv.units or 0)
                        inv.last_price_at = datetime.utcnow()
                        updated_count += 1
                except Exception as e:
                    logger.error(f"Error updating {inv.symbol}: {e}")
            
            db_session.commit()
            logger.info(f"Updated {updated_count} investments for user {user_id}")

    # Add task to background
    background_tasks.add_task(update_prices_task, current_user.id)
    return {"status": "initiated", "message": "Market sync started in background"}