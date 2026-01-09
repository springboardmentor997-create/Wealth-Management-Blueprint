from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.goal import Goal
from app.models.user import User
from app.schemas.goal_schema import GoalCreate, GoalOut # Assuming you have these schemas
from pydantic import BaseModel

# 1. Initialize the Router
router = APIRouter(prefix="/goals", tags=["goals"])

# 2. Local Schemas
class ContributionRequest(BaseModel):
    amount: float

# 3. Routes

@router.get("/all", response_model=List[GoalOut])
def get_my_goals(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Fetch all goals belonging to the logged-in user."""
    return db.query(Goal).filter(Goal.user_id == current_user.id).all()

@router.post("/create", response_model=GoalOut)
def create_goal(
    goal_data: GoalCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Create a new financial goal."""
    new_goal = Goal(
        **goal_data.dict(),
        user_id=current_user.id
    )
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    return new_goal

@router.post("/{goal_id}/contribute")
def add_money_to_goal(
    goal_id: int, 
    req: ContributionRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Allocate funds from the portfolio/cash to a specific goal."""
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found or unauthorized")
    
    # Logic: Increase the progress
    goal.current_amount += req.amount
    db.commit()
    db.refresh(goal)
    
    return {
        "msg": f"Successfully allocated ₹{req.amount} to {goal.title}",
        "new_balance": goal.current_amount,
        "percent_complete": round((goal.current_amount / goal.target_amount) * 100, 2) if goal.target_amount > 0 else 0
    }

@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Remove a goal record."""
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    db.delete(goal)
    db.commit()
    return {"msg": "Goal deleted successfully"}