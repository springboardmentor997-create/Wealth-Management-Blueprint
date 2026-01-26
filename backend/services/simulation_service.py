from typing import Dict, Any, List
import datetime

def calculate_compound_interest(
    initial_amount: float,
    monthly_contribution: float,
    annual_interest_rate: float,
    years: int,
    inflation_rate: float = 0.0
) -> Dict[str, Any]:
    """
    Calculates compound interest projection matching the reference project logic.
    - Yearly iteration
    - Annual contribution added fully
    - Returns reduced by inflation linearly
    """
    
    current_balance = float(initial_amount)
    total_contributions = float(initial_amount)
    
    timeline = []
    
    # Year 0
    timeline.append({
        "year": 0,
        "value": round(current_balance),
        "contributed": round(total_contributions)
    })
    
    # Reference Logic: Iterate by year
    for year in range(1, years + 1):
        # Add annual contributions (Reference adds them at start/during year)
        annual_contribution = monthly_contribution * 12
        current_balance += annual_contribution
        total_contributions += annual_contribution
        
        # Apply Growth
        current_balance *= (1 + annual_interest_rate / 100)
        
        # Apply Inflation (Reference Logic: value *= 1 - inflation/100)
        # Note: This is a rough approximation used in the reference, mathematically imperfect but requested.
        current_balance *= (1 - inflation_rate / 100)
        
        timeline.append({
            "year": year,
            "value": round(current_balance),
            "contributed": round(total_contributions)
        })
            
    return {
        "projectedValue": round(current_balance),
        "contributed": round(total_contributions),
        "confidence": 85, # Hardcoded in reference
        "timeline": timeline,
        # Keep these for backward compatibility if needed, but primary is above
        "summary": {
            "final_balance": round(current_balance),
            "total_contributions": round(total_contributions),
            "total_interest_earned": round(current_balance - total_contributions)
        },
        "yearly_breakdown": [{"year": t["year"], "balance": t["value"], "contributions": t["contributed"]} for t in timeline]
    }
