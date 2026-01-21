from fastapi import APIRouter, Depends, HTTPException, status # pyright: ignore[reportMissingImports]
from sqlalchemy.orm import Session # pyright: ignore[reportMissingImports]
from typing import List
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.services.recommendations import (
    generate_allocation_recommendation,
    generate_goal_based_recommendation
)
from collections import defaultdict

router = APIRouter()

@router.post("/generate", response_model=schemas.RecommendationResponse, status_code=status.HTTP_201_CREATED)
async def generate_recommendation(
    goal_id: int = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate personalized recommendations based on user's risk profile and portfolio
    """
    # Get user's current portfolio
    investments = db.query(models.Investment).filter(
        models.Investment.user_id == current_user.id
    ).all()
    
    # Calculate current allocations
    total_value = sum(
        float(inv.current_value) if inv.current_value else float(inv.cost_basis)
        for inv in investments
    )
    
    current_allocations = defaultdict(float)
    for inv in investments:
        inv_value = float(inv.current_value) if inv.current_value else float(inv.cost_basis)
        if total_value > 0:
            current_allocations[inv.asset_type.value] += (inv_value / total_value) * 100
    
    # Generate allocation recommendation
    allocation_rec = generate_allocation_recommendation(
        risk_profile=current_user.risk_profile,
        current_portfolio_value=total_value,
        current_allocations=dict(current_allocations)
    )
    
    # Generate goal-based recommendations if goal_id provided
    goal_recommendations = None
    if goal_id:
        goal = db.query(models.Goal).filter(
            models.Goal.id == goal_id,
            models.Goal.user_id == current_user.id
        ).first()
        
        if goal:
            from datetime import date
            today = date.today()
            months_remaining = (goal.target_date.year - today.year) * 12 + (goal.target_date.month - today.month)
            
            goal_recommendations = generate_goal_based_recommendation(
                goal_type=goal.goal_type.value,
                target_amount=float(goal.target_amount),
                months_remaining=months_remaining,
                risk_profile=current_user.risk_profile
            )
    
    # Build recommendation text
    recommendation_text = f"Based on your {current_user.risk_profile.value} risk profile:\n\n"
    
    if allocation_rec["rebalance_suggestions"]:
        recommendation_text += "Rebalancing Suggestions:\n"
        for suggestion in allocation_rec["rebalance_suggestions"]:
            action = "increase" if suggestion["action"] == "increase" else "decrease"
            recommendation_text += f"- {action.capitalize()} {suggestion['asset_type']} allocation by ${abs(suggestion['adjustment_amount']):,.2f}\n"
        recommendation_text += "\n"
    
    if goal_recommendations:
        recommendation_text += "Goal-Specific Recommendations:\n"
        for rec in goal_recommendations.get("recommendations", []):
            recommendation_text += f"- {rec['title']}: {rec['text']}\n"
    
    # Create recommendation record
    db_recommendation = models.Recommendation(
        user_id=current_user.id,
        title=f"Portfolio Recommendations - {current_user.risk_profile.value.capitalize()} Profile",
        recommendation_text=recommendation_text,
        suggested_allocation=allocation_rec
    )
    db.add(db_recommendation)
    db.commit()
    db.refresh(db_recommendation)
    return db_recommendation

@router.get("/", response_model=List[schemas.RecommendationResponse])
async def get_recommendations(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all recommendations for the current user
    """
    recommendations = db.query(models.Recommendation).filter(
        models.Recommendation.user_id == current_user.id
    ).order_by(models.Recommendation.created_at.desc()).all()
    return recommendations

@router.get("/{recommendation_id}", response_model=schemas.RecommendationResponse)
async def get_recommendation(
    recommendation_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific recommendation
    """
    recommendation = db.query(models.Recommendation).filter(
        models.Recommendation.id == recommendation_id,
        models.Recommendation.user_id == current_user.id
    ).first()
    
    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found"
        )
    
    return recommendation

@router.get("/allocation/current", response_model=dict)
async def get_current_allocation(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current portfolio allocation breakdown
    """
    investments = db.query(models.Investment).filter(
        models.Investment.user_id == current_user.id
    ).all()
    
    total_value = sum(
        float(inv.current_value) if inv.current_value else float(inv.cost_basis)
        for inv in investments
    )
    
    allocations = defaultdict(float)
    for inv in investments:
        inv_value = float(inv.current_value) if inv.current_value else float(inv.cost_basis)
        if total_value > 0:
            allocations[inv.asset_type.value] += (inv_value / total_value) * 100
    
    recommended = generate_allocation_recommendation(
        risk_profile=current_user.risk_profile,
        current_portfolio_value=total_value,
        current_allocations=dict(allocations)
    )
    
    return {
        "current_allocation": dict(allocations),
        "recommended_allocation": recommended["recommended_allocation"],
        "rebalance_suggestions": recommended["rebalance_suggestions"],
        "total_value": total_value
    }

