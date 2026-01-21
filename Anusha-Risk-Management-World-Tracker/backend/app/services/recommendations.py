from typing import Dict, Any, List
from app.models import RiskProfile, AssetType
from decimal import Decimal

# Risk-based allocation templates
ALLOCATION_TEMPLATES = {
    RiskProfile.conservative: {
        "stocks": 30,
        "bonds": 50,
        "cash": 10,
        "etf": 10
    },
    RiskProfile.moderate: {
        "stocks": 50,
        "bonds": 30,
        "cash": 5,
        "etf": 15
    },
    RiskProfile.aggressive: {
        "stocks": 70,
        "bonds": 15,
        "cash": 5,
        "etf": 10
    }
}

def generate_allocation_recommendation(
    risk_profile: RiskProfile,
    current_portfolio_value: float,
    current_allocations: Dict[str, float] = None
) -> Dict[str, Any]:
    """
    Generate recommended allocation based on risk profile
    """
    target_allocation = ALLOCATION_TEMPLATES.get(risk_profile, ALLOCATION_TEMPLATES[RiskProfile.moderate])
    
    recommended_allocation = {}
    for asset_type, percentage in target_allocation.items():
        recommended_allocation[asset_type] = {
            "percentage": percentage,
            "target_value": current_portfolio_value * (percentage / 100)
        }
    
    rebalance_suggestions = []
    if current_allocations:
        for asset_type, target_pct in target_allocation.items():
            current_pct = current_allocations.get(asset_type, 0)
            difference = target_pct - current_pct
            
            if abs(difference) > 5:  # Threshold for rebalancing
                current_value = current_portfolio_value * (current_pct / 100)
                target_value = current_portfolio_value * (target_pct / 100)
                adjustment = target_value - current_value
                
                rebalance_suggestions.append({
                    "asset_type": asset_type,
                    "current_allocation": round(current_pct, 2),
                    "target_allocation": round(target_pct, 2),
                    "adjustment_amount": round(adjustment, 2),
                    "action": "increase" if adjustment > 0 else "decrease"
                })
    
    return {
        "risk_profile": risk_profile.value,
        "recommended_allocation": recommended_allocation,
        "rebalance_suggestions": rebalance_suggestions,
        "total_value": current_portfolio_value
    }

def generate_goal_based_recommendation(
    goal_type: str,
    target_amount: float,
    months_remaining: int,
    risk_profile: RiskProfile
) -> Dict[str, Any]:
    """
    Generate recommendations based on goal type and timeline
    """
    recommendations = []
    
    if goal_type == "retirement":
        if months_remaining > 240:  # More than 20 years
            recommendations.append({
                "title": "Long-term Growth Strategy",
                "text": "With over 20 years until retirement, consider a more aggressive allocation to maximize growth potential.",
                "priority": "high"
            })
        elif months_remaining < 60:  # Less than 5 years
            recommendations.append({
                "title": "Capital Preservation",
                "text": "With less than 5 years until retirement, consider shifting to more conservative investments to protect capital.",
                "priority": "high"
            })
    
    elif goal_type == "home":
        if months_remaining < 24:
            recommendations.append({
                "title": "Short-term Savings",
                "text": "For a home purchase within 2 years, focus on low-risk investments like high-yield savings or short-term bonds.",
                "priority": "high"
            })
    
    elif goal_type == "education":
        recommendations.append({
            "title": "Education Savings Strategy",
            "text": "Consider 529 plans or education-focused investment accounts for tax advantages.",
            "priority": "medium"
        })
    
    # Risk-based recommendations
    if risk_profile == RiskProfile.conservative:
        recommendations.append({
            "title": "Conservative Portfolio",
            "text": "Your conservative risk profile suggests focusing on bonds and stable dividend stocks.",
            "priority": "medium"
        })
    elif risk_profile == RiskProfile.aggressive:
        recommendations.append({
            "title": "Growth Opportunities",
            "text": "With an aggressive risk profile, consider growth stocks and sector-specific ETFs.",
            "priority": "medium"
        })
    
    return {
        "goal_type": goal_type,
        "recommendations": recommendations,
        "allocation": generate_allocation_recommendation(risk_profile, target_amount)
    }

