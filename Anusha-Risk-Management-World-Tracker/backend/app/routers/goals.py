from fastapi import APIRouter, Depends, HTTPException, status # pyright: ignore[reportMissingImports]
from sqlalchemy.orm import Session # pyright: ignore[reportMissingImports]
from typing import List
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal: schemas.GoalCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_goal = models.Goal(**goal.model_dump(), user_id=current_user.id)
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.get("/", response_model=List[schemas.GoalResponse])
async def get_goals(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goals = db.query(models.Goal).filter(models.Goal.user_id == current_user.id).all()
    return goals

@router.get("/{goal_id}", response_model=schemas.GoalResponse)
async def get_goal(
    goal_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(models.Goal).filter(
        models.Goal.id == goal_id,
        models.Goal.user_id == current_user.id
    ).first()
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    return goal

@router.put("/{goal_id}", response_model=schemas.GoalResponse)
async def update_goal(
    goal_id: int,
    goal_update: schemas.GoalUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(models.Goal).filter(
        models.Goal.id == goal_id,
        models.Goal.user_id == current_user.id
    ).first()
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    update_data = goal_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(goal, field, value)
    db.commit()
    db.refresh(goal)
    return goal

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(models.Goal).filter(
        models.Goal.id == goal_id,
        models.Goal.user_id == current_user.id
    ).first()
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    db.delete(goal)
    db.commit()
    return None

@router.get("/{goal_id}/progress")
async def get_goal_progress(
    goal_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get progress information for a specific goal
    """
    goal = db.query(models.Goal).filter(
        models.Goal.id == goal_id,
        models.Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    # Calculate current savings from portfolio
    investments = db.query(models.Investment).filter(
        models.Investment.user_id == current_user.id
    ).all()
    current_savings = sum(
        float(inv.current_value) if inv.current_value else float(inv.cost_basis)
        for inv in investments
    )
    
    # Calculate progress
    target_amount = float(goal.target_amount)
    progress_percent = (current_savings / target_amount * 100) if target_amount > 0 else 0
    
    # Calculate time remaining
    from datetime import date
    today = date.today()
    months_remaining = (goal.target_date.year - today.year) * 12 + (goal.target_date.month - today.month)
    
    # Calculate projected amount based on current contribution rate
    monthly_contribution = float(goal.monthly_contribution)
    projected_final = current_savings + (monthly_contribution * months_remaining) if months_remaining > 0 else current_savings
    
    return {
        "goal_id": goal_id,
        "current_savings": round(current_savings, 2),
        "target_amount": target_amount,
        "progress_percent": round(progress_percent, 2),
        "months_remaining": months_remaining,
        "monthly_contribution": monthly_contribution,
        "projected_final": round(projected_final, 2),
        "shortfall": round(target_amount - projected_final, 2) if projected_final < target_amount else 0,
        "is_on_track": projected_final >= target_amount
    }

