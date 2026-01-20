from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional, Dict, Any, Any as AnyType
from datetime import datetime
from core.database import get_session
from core.security import get_current_user
from models.user import User
from models.recommendation import Recommendation
from models.investment import Investment
from models.goal import Goal
from models.watchlist import Watchlist

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


class RecommendationCreate(BaseModel):
    title: str
    recommendation_text: str
    suggested_allocation: Optional[Dict[str, Any]] = None
    status: str = "pending"
    priority: Optional[int] = None


class RecommendationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    recommendation_text: str
    suggested_allocation: Any
    status: str
    priority: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.post("/", response_model=RecommendationResponse, status_code=status.HTTP_201_CREATED)
def create_recommendation(rec_data: RecommendationCreate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    new_rec = Recommendation(
        user_id=current_user.id,
        title=rec_data.title,
        recommendation_text=rec_data.recommendation_text,
        suggested_allocation=rec_data.suggested_allocation or {},
        status=rec_data.status,
        priority=rec_data.priority
    )
    session.add(new_rec)
    session.commit()
    session.refresh(new_rec)
    return new_rec


@router.get("/", response_model=list[RecommendationResponse])
def get_recommendations(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(
        select(Recommendation).where(Recommendation.user_id == current_user.id)
    ).all()


@router.get("/{rec_id}", response_model=RecommendationResponse)
def get_recommendation(rec_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    rec = session.get(Recommendation, rec_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    if rec.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return rec


@router.put("/{rec_id}", response_model=RecommendationResponse)
def update_recommendation(rec_id: int, rec_data: RecommendationCreate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    rec = session.get(Recommendation, rec_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    if rec.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = rec_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(rec, key, value)
    session.commit()
    session.refresh(rec)
    return rec


@router.delete("/{rec_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recommendation(rec_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    rec = session.get(Recommendation, rec_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    if rec.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    session.delete(rec)
    session.commit()
    return None


# ===================== PERSONALIZED RECOMMENDATIONS =====================

@router.get("/personalized/suggestions")
async def get_personalized_recommendations(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Get personalized portfolio recommendations based on risk profile, goals, and watchlist"""
    from services.recommendation_service import (
        get_risk_profile_allocations,
        calculate_current_allocation
    )

    # Get user's risk profile
    user = session.get(User, current_user.id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    risk_profile = user.risk_profile or "moderate"
    
    # Get user's investments for current allocation
    statement = select(Investment).where(Investment.user_id == current_user.id)
    investments = session.exec(statement).all()
    
    # Get user's watchlist
    try:
        watchlist_stmt = select(Watchlist).where(Watchlist.user_id == current_user.id)
        watchlist = session.exec(watchlist_stmt).all()
    except:
        watchlist = []
    
    # Get user's active goals
    goals_stmt = select(Goal).where(
        Goal.user_id == current_user.id,
        Goal.status == "active"
    )
    goals = session.exec(goals_stmt).all()
    
    # Calculate recommendations
    recommended_alloc = get_risk_profile_allocations(risk_profile)
    current_alloc = calculate_current_allocation(investments)
    
    # Generate insights
    insights = []
    
    # Check if portfolio is aligned with risk profile
    alignment_score = 100.0
    
    # Compare each asset class
    for asset, target_pct in recommended_alloc.items():
        curr_pct = current_alloc.get(asset, 0)
        
        # Tolerance check (e.g., 15% drift)
        drift = abs(target_pct - curr_pct)
        if drift > 0.15:
            insights.append(
                f"Your {asset} allocation ({curr_pct*100:.0f}%) differs significantly from "
                f"recommended ({target_pct*100:.0f}%) for {risk_profile} risk profile"
            )
            alignment_score -= 10
            
    # Check watchlist for buying opportunities
    if watchlist:
        high_performers = [w for w in watchlist if (w.current_price - w.price_at_added) / w.price_at_added > 0.10]
        if high_performers:
            insights.append(
                f"You have {len(high_performers)} watchlist item(s) with strong gains. "
                f"Consider taking profits or rebalancing."
            )
    
    # Check goals alignment
    if goals:
        short_term_goals = [g for g in goals if g.target_date and (datetime.fromisoformat(str(g.target_date)).date() - datetime.now().date()).days < 365]
        if short_term_goals:
            insights.append(
                f"You have {len(short_term_goals)} short-term goals. "
                f"Consider maintaining higher cash/bond allocation."
            )
    
    if not insights:
        insights.append("Your portfolio allocation is well-aligned with your risk profile and goals.")
    
    # Get top watchlist items for recommendations
    recommended_stocks = []
    if watchlist:
        # Simple sorting by gain
        top_watchlist = sorted(watchlist, key=lambda x: (x.current_price - x.price_at_added), reverse=True)[:3]
        recommended_stocks = [
            {
                "symbol": w.symbol,
                "name": w.name,
                "current_price": w.current_price,
                "sector": w.sector,
                "gain_percent": round(((w.current_price - w.price_at_added) / w.price_at_added) * 100, 2)
                if w.price_at_added > 0 else 0,
            }
            for w in top_watchlist
        ]
    
    return {
        "risk_profile": risk_profile,
        "alignment_score": max(0, round(alignment_score, 1)),
        "recommended_allocation": recommended_alloc,
        "current_allocation": current_alloc,
        "insights": insights,
        "top_watchlist_stocks": recommended_stocks,
        "active_goals_count": len(goals),
        "watchlist_items_count": len(watchlist),
        "timestamp": datetime.now().isoformat(),
    }


@router.get("/personalized/rebalancing")
async def get_rebalancing_strategy(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Get recommendations for portfolio rebalancing"""
    from services.recommendation_service import (
        get_risk_profile_allocations,
        calculate_current_allocation,
        generate_rebalancing_actions
    )
    
    user = session.get(User, current_user.id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    risk_profile = user.risk_profile or "moderate"
    
    # Get investments
    statement = select(Investment).where(Investment.user_id == current_user.id)
    investments = session.exec(statement).all()
    
    recommended_alloc = get_risk_profile_allocations(risk_profile)
    current_alloc = calculate_current_allocation(investments)
    
    # Calculate total value
    total_value = sum((inv.quantity or 0) * (inv.current_value or inv.purchase_price or 0) for inv in investments)
    # Note: Logic in service handles value calculation per item, but we need total here for rebalancing calc
    # Actually service calc_current_alloc handles percentages.
    # To get rebalancing ACTIONS ($ amount), the service needs total value passed in?
    # Let's check service signature: generate_rebalancing_actions(current_alloc, target_alloc, total_value)
    # So we need to compute total_value here.
    
    # Refined total value calculation matching service logic roughly
    total_val = 0.0
    for inv in investments:
        qty = float(inv.quantity or inv.units or 0)
        price = float(inv.current_value or inv.last_price or 0) # Use current value/unit price logic
        # Actually existing service logic for `calculate_current_allocation` computed values internally.
        # But here we need the sum.
        if inv.current_value:
             total_val += float(inv.current_value)
        elif qty and price:
             total_val += qty * price
             
    actions = generate_rebalancing_actions(current_alloc, recommended_alloc, total_val)
    
    return {
        "risk_profile": risk_profile,
        "portfolio_total_value": round(total_val, 2),
        "rebalancing_actions": actions,
        "suggested_frequency": "Quarterly" if risk_profile == "aggressive" else "Semi-annually",
        "timestamp": datetime.now().isoformat(),
    }
