from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid

from database import get_db
from models import Goal, User
from schemas import GoalCreate, Goal as GoalSchema
from auth import get_current_user

router = APIRouter(prefix="/api/goals", tags=["goals"])

@router.get("/", response_model=List[GoalSchema])
async def get_goals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).order_by(Goal.created_at.desc()).all()
    return goals

@router.post("/", response_model=GoalSchema)
async def create_goal(goal_data: GoalCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal_id = str(uuid.uuid4())
    
    goal = Goal(
        id=goal_id,
        user_id=current_user.id,
        title=goal_data.title,
        goal_type=goal_data.goal_type,
        target_amount=goal_data.target_amount,
        current_amount=goal_data.current_amount or 0,
        target_date=goal_data.target_date,
        monthly_contribution=goal_data.monthly_contribution,
        status="active"
    )
    
    db.add(goal)
    db.commit()
    db.refresh(goal)
    
    return goal

@router.put("/{goal_id}", response_model=GoalSchema)
async def update_goal(goal_id: str, goal_data: GoalCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    goal.title = goal_data.title
    goal.goal_type = goal_data.goal_type
    goal.target_amount = goal_data.target_amount
    goal.current_amount = goal_data.current_amount
    goal.target_date = goal_data.target_date
    goal.monthly_contribution = goal_data.monthly_contribution
    # updated_at is handled by onupdate in model
    
    db.commit()
    db.refresh(goal)
    
    return goal

@router.delete("/{goal_id}")
async def delete_goal(goal_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    db.delete(goal)
    db.commit()
    
    return {"message": "Goal deleted successfully"}