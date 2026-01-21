from typing import Dict, Any, Optional
from datetime import date, datetime
from decimal import Decimal
import math

def calculate_goal_simulation(
    target_amount: float,
    target_date: date,
    monthly_contribution: float,
    current_savings: float = 0,
    annual_return_rate: float = 7.0,
    inflation_rate: float = 3.0
) -> Dict[str, Any]:
    """
    Calculate goal simulation with assumptions
    Returns projection of whether goal will be met
    """
    today = date.today()
    months_remaining = (target_date.year - today.year) * 12 + (target_date.month - today.month)
    
    if months_remaining <= 0:
        return {
            "status": "past_due",
            "message": "Target date has passed",
            "projected_amount": current_savings,
            "target_amount": target_amount,
            "shortfall": target_amount - current_savings
        }
    
    # Calculate future value with monthly contributions
    monthly_rate = annual_return_rate / 12 / 100
    future_value_contributions = monthly_contribution * (
        ((1 + monthly_rate) ** months_remaining - 1) / monthly_rate
    ) if monthly_rate > 0 else monthly_contribution * months_remaining
    
    # Future value of current savings
    future_value_current = current_savings * ((1 + monthly_rate) ** months_remaining)
    
    projected_amount = future_value_current + future_value_contributions
    
    # Adjust for inflation
    inflation_factor = (1 + inflation_rate / 100) ** (months_remaining / 12)
    inflation_adjusted_target = target_amount * inflation_factor
    
    shortfall = inflation_adjusted_target - projected_amount
    is_on_track = projected_amount >= inflation_adjusted_target
    
    # Calculate required monthly contribution to meet goal
    if not is_on_track and monthly_rate > 0:
        required_contribution = (
            (inflation_adjusted_target - future_value_current) * monthly_rate
        ) / ((1 + monthly_rate) ** months_remaining - 1)
    else:
        required_contribution = monthly_contribution
    
    return {
        "status": "on_track" if is_on_track else "needs_adjustment",
        "projected_amount": round(projected_amount, 2),
        "target_amount": round(inflation_adjusted_target, 2),
        "current_savings": current_savings,
        "shortfall": round(shortfall, 2) if shortfall > 0 else 0,
        "surplus": round(-shortfall, 2) if shortfall < 0 else 0,
        "months_remaining": months_remaining,
        "assumptions": {
            "annual_return_rate": annual_return_rate,
            "inflation_rate": inflation_rate,
            "monthly_contribution": monthly_contribution
        },
        "required_monthly_contribution": round(required_contribution, 2) if required_contribution > monthly_contribution else monthly_contribution,
        "is_on_track": is_on_track
    }

def run_what_if_scenario(
    base_target_amount: float,
    base_target_date: date,
    base_monthly_contribution: float,
    scenario_name: str,
    assumptions: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Run a what-if scenario with different assumptions
    """
    target_amount = assumptions.get("target_amount", base_target_amount)
    target_date = assumptions.get("target_date", base_target_date)
    monthly_contribution = assumptions.get("monthly_contribution", base_monthly_contribution)
    annual_return_rate = assumptions.get("annual_return_rate", 7.0)
    inflation_rate = assumptions.get("inflation_rate", 3.0)
    current_savings = assumptions.get("current_savings", 0)
    
    result = calculate_goal_simulation(
        target_amount=target_amount,
        target_date=target_date,
        monthly_contribution=monthly_contribution,
        current_savings=current_savings,
        annual_return_rate=annual_return_rate,
        inflation_rate=inflation_rate
    )
    
    return {
        "scenario_name": scenario_name,
        "assumptions": assumptions,
        "results": result,
        "created_at": datetime.utcnow().isoformat()
    }

