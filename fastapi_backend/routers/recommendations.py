from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import uuid

from database import get_db
from models import User, Investment, Goal
from schemas import Recommendation, RebalanceRecommendation
from auth import get_current_user

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

@router.get("/", response_model=List[Recommendation])
async def get_recommendations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Generate personalized recommendations based on user's portfolio, risk profile, and goals.
    This replaces the static mock data.
    """
    recommendations = []
    
    # Fetch user data
    investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    
    # Calculate portfolio metrics
    total_value = sum((inv.current_value or 0) for inv in investments)
    
    # 1. Goal Setting Check
    if not goals:
        recommendations.append(Recommendation(
            id=1,
            title="Set Your First Financial Goal",
            description="You haven't set any financial goals yet. Defining clear goals (like Retirement, Home, or Vacation) helps track progress.",
            priority="high",
            expected_impact="Improved tracking & discipline",
            action_link="/goals"
        ))
    
    # 2. Portfolio Logic (only if they have investments)
    if total_value > 0:
        allocation = {"Equity": 0.0, "Debt": 0.0, "Cash": 0.0}
        
        for inv in investments:
            val = inv.current_value or 0
            atype = inv.asset_type.lower()
            if atype in ["stock", "etf", "mutual_fund"]:
                allocation["Equity"] += val
            elif atype in ["bond"]:
                allocation["Debt"] += val
            elif atype in ["cash"]:
                allocation["Cash"] += val
        
        equity_pct = (allocation["Equity"] / total_value) * 100
        cash_pct = (allocation["Cash"] / total_value) * 100
        debt_pct = (allocation["Debt"] / total_value) * 100
        
        risk_profile = (current_user.risk_profile or "moderate").lower()
        
        # Rule: Emergency Fund (Cash Buffer)
        if cash_pct < 5 and total_value > 10000:
            recommendations.append(Recommendation(
                id=2,
                title="Build Emergency Fund",
                description="Your cash allocation is very low (< 5%). Consider keeping 3-6 months of expenses in liquid funds.",
                priority="high",
                expected_impact="Financial Stability",
                action_link="/portfolio"
            ))
            
        # Rule: Idle Cash
        if cash_pct > 30 and risk_profile != "conservative":
            recommendations.append(Recommendation(
                id=3,
                title="Deploy Idle Cash",
                description=f"You have {round(cash_pct)}% in cash. Inflation eats into your purchasing power. Consider investing based on your profile.",
                priority="medium",
                expected_impact="Better Inflation-adjusted Returns",
                action_link="/portfolio"
            ))

        # Rule: Risk Profile Alignment
        if risk_profile == "aggressive":
            if equity_pct < 60:
                 recommendations.append(Recommendation(
                    id=4,
                    title="Increase Equity Exposure",
                    description="Your profile is Aggressive, but your equity exposure is low. Increase stock/fund allocation to maximize growth.",
                    priority="medium",
                    expected_impact="+2-4% Potential Long-term Return",
                    action_link="/portfolio"
                ))
        elif risk_profile == "conservative":
            if equity_pct > 30:
                recommendations.append(Recommendation(
                    id=5,
                    title="Reduce Risk Exposure",
                    description="Your profile is Conservative, but you have high equity exposure. Consider checking debt/bond funds.",
                    priority="high",
                    expected_impact="Capital Preservation",
                    action_link="/portfolio"
                ))

        # Rule: Diversification (Simple check on number of holdings)
        if len(investments) < 3:
             recommendations.append(Recommendation(
                id=6,
                title="Diversify Portfolio",
                description="Your portfolio is concentrated in very few assets. Add more instruments to spread risk.",
                priority="medium",
                expected_impact="Lower Volatility",
                action_link="/portfolio"
            ))

    # If no recommendations triggered (e.g. perfect portfolio), give a kudos
    if not recommendations and total_value > 0:
        recommendations.append(Recommendation(
            id=7,
            title="Portfolio Looks Healthy",
            description="Your current allocation aligns well with your risk profile. Keep monitoring your goals.",
            priority="low",
            expected_impact="Maintenance",
            action_link="/reports"
        ))
        
    # Check if empty (new user)
    if not recommendations and total_value == 0:
         recommendations.append(Recommendation(
            id=8,
            title="Start Investing",
            description="You have no investments recorded. Start by adding your first investment to track your wealth.",
            priority="high",
            expected_impact="Wealth Creation",
            action_link="/portfolio"
        ))

    return recommendations

@router.get("/rebalance", response_model=List[RebalanceRecommendation])
async def get_rebalance_recommendations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    
    # 1. Calculate Current Allocation
    investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
    
    total_value = sum(inv.current_value or 0 for inv in investments)
    if total_value == 0:
        return []

    allocation = {
        "Equity": 0.0,
        "Debt": 0.0,
        "Cash": 0.0,
        "Other": 0.0
    }
    
    for inv in investments:
        val = inv.current_value or 0
        atype = inv.asset_type.lower()
        if atype in ["stock", "etf", "mutual_fund"]:
            allocation["Equity"] += val
        elif atype in ["bond"]:
            allocation["Debt"] += val
        elif atype in ["cash"]:
            allocation["Cash"] += val
        else:
            allocation["Other"] += val

    # 2. Define Target Allocation based on Risk Profile
    risk_profile = (current_user.risk_profile or "moderate").lower()
    
    targets = {
        "conservative": {"Equity": 20, "Debt": 60, "Cash": 20},
        "moderate":     {"Equity": 50, "Debt": 30, "Cash": 20},
        "aggressive":   {"Equity": 80, "Debt": 10, "Cash": 10}
    }
    
    # Fallback to moderate if unknown
    target_alloc = targets.get(risk_profile, targets["moderate"])
    
    # 3. Generate Recommendations
    rebalance_recs = []
    
    for asset_class, target_pct in target_alloc.items():
        current_amt = allocation.get(asset_class, 0)
        current_pct = (current_amt / total_value) * 100
        
        diff = target_pct - current_pct
        
        # Only recommend if deviation is > 5%
        if abs(diff) > 5:
            amount_diff = total_value * (abs(diff) / 100)
            action_type = "Buy" if diff > 0 else "Sell"
            
            rebalance_recs.append(RebalanceRecommendation(
                asset_class=asset_class,
                current_percentage=round(current_pct, 1),
                target_percentage=target_pct,
                action=f"{action_type} ₹{round(amount_diff):,} worth of {asset_class} to reach {target_pct}%"
            ))
        else:
            # Add record even if balanced, with no action needed (optional, but good for UI)
            rebalance_recs.append(RebalanceRecommendation(
                asset_class=asset_class,
                current_percentage=round(current_pct, 1),
                target_percentage=target_pct,
                action="Balanced"
            ))
            
    return rebalance_recs

@router.post("/{recommendation_id}/apply")
async def apply_recommendation(recommendation_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return {"success": True, "message": "Recommendation applied successfully"}