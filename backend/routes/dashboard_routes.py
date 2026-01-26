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
    total_value = sum((float(i.current_value) if i.current_value else 0) for i in investments)
    total_cost = sum((float(i.cost_basis) if i.cost_basis else 0) for i in investments)
    
    # Fallback: If live value is 0 (sync pending/failed), show cost basis so dashboard isn't empty
    if total_value == 0 and total_cost > 0:
        total_value = total_cost
    
    total_goals = len(goals)
    completed_goals = len([g for g in goals if g.status == GoalStatus.completed])

    return {
        "total_invested": float(total_cost), # Actual invested amount (cost basis)
        "total_value": float(total_value),   # Current market value
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
    
    # SIMULATED HISTORY FOR DEMO
    # Real app would query a historical balance table.
    # We generate a 6-month trend ending at current_total.
    
    from datetime import datetime, timedelta
    import random
    
    data_points = []
    
    # We'll create a trend for the last 6 months
    # Current month is the last point
    today = datetime.now()
    
    # Generate points working backwards
    simulated_value = current_total
    
    # If total is 0, just return flat line of 0s
    if current_total == 0:
         # Return at least 2 points so chart doesn't break?
         # But usually graph handles 0 fine, or empty state.
         # Let's just return 6 months of 0
         pass 

    for i in range(5, -1, -1):
        # Calculate month label (e.g., "Jan")
        # Go back 'i' months roughly (30 days * i)
        date_point = today - timedelta(days=30 * i)
        month_label = date_point.strftime("%b")
        
        # Add point
        data_points.append({"month": month_label, "value": round(simulated_value, 2)})
        
        # Prepare for next iteration (going backwards in time, so previous month was likely lower)
        # We want the *graph* to go LEFT to RIGHT (Past -> Present)
        # So we should probably construct the list from Past -> Present
        pass

    # Correct Approach: Construct explicit timeline from 5 months ago to today
    final_data = []
    
    # Base value 5 months ago (approx 80-90% of current)
    if current_total > 0:
        base_val = current_total * 0.85 
    else:
        base_val = 0
        
    for i in range(6):
        # 0 = 5 months ago, 5 = today
        months_ago = 5 - i
        date_point = today - timedelta(days=30 * months_ago)
        month_label = date_point.strftime("%b")
        
        if i == 5:
            # Last point MUST be exact current total
            val = current_total
        else:
            # Interpolate a somewhat random path from base to current
            # Linear progress + some noise
            progress = i / 5.0 # 0.0 to 1.0
            # value = base + (total - base) * progress
            trend_val = base_val + (current_total - base_val) * progress
            # Add -5% to +5% noise relative to current_total, but keep it plausible
            noise = (random.random() - 0.5) * 0.1 * current_total
            val = max(0, trend_val + noise)
            
        final_data.append({"month": month_label, "value": round(val, 2)})

    return final_data

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