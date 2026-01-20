from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from decimal import Decimal
from core.database import get_session
from core.security import get_current_user
from models.user import User
from models.goal import Goal, GoalType, GoalStatus
from datetime import date, datetime

router = APIRouter(prefix="/goals", tags=["Goals"])


class GoalCreate(BaseModel):
    goal_type: GoalType
    target_amount: Decimal
    target_date: date
    monthly_contribution: Decimal


class GoalUpdate(BaseModel):
    goal_type: GoalType | None = None
    target_amount: Decimal | None = None
    target_date: date | None = None
    monthly_contribution: Decimal | None = None
    status: GoalStatus | None = None


class GoalResponse(BaseModel):
    id: int
    user_id: int
    goal_type: GoalType
    target_amount: Decimal
    target_date: date
    monthly_contribution: Decimal
    status: GoalStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(goal_data: GoalCreate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    goal = Goal(
        user_id=current_user.id,
        goal_type=goal_data.goal_type,
        target_amount=goal_data.target_amount,
        target_date=goal_data.target_date,
        monthly_contribution=goal_data.monthly_contribution,
        status=GoalStatus.active
    )
    session.add(goal)
    session.commit()
    session.refresh(goal)
    return goal


@router.get("/", response_model=list[GoalResponse])
def get_all_goals(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    goals = session.exec(select(Goal).where(Goal.user_id == current_user.id)).all()
    return goals


@router.get("/{goal_id}", response_model=GoalResponse)
def get_goal(goal_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    goal = session.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return goal


@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(goal_id: int, goal_data: GoalUpdate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    goal = session.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = goal_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(goal, key, value)
    session.commit()
    session.refresh(goal)
    return goal


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(goal_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    goal = session.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    session.delete(goal)
    session.commit()
    return None
