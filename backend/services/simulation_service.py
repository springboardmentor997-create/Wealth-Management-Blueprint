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
    Calculates compound interest projection with optional inflation adjustment.
    
    Args:
        initial_amount: Starting principal
        monthly_contribution: Amount added each month
        annual_interest_rate: Expected annual return (in percent)
        years: Duration in years
        inflation_rate: Annual inflation rate (in percent)
        
    Returns:
        Dict with 'summary' and 'yearly_breakdown'
    """
    
    # Calculate Real Rate of Return if inflation > 0
    # Formula: (1 + nominal) / (1 + inflation) - 1
    if inflation_rate > 0:
        nominal_multiplier = 1 + (annual_interest_rate / 100)
        inflation_multiplier = 1 + (inflation_rate / 100)
        real_rate_percent = ((nominal_multiplier / inflation_multiplier) - 1) * 100
        # Use real rate for calculation
        effective_rate = real_rate_percent
    else:
        effective_rate = annual_interest_rate

    monthly_rate = (effective_rate / 100) / 12
    total_months = years * 12
    
    current_balance = initial_amount
    total_contributions = initial_amount
    
    yearly_data = []
    
    # Year 0 point
    yearly_data.append({
        "year": 0,
        "balance": round(current_balance, 2),
        "contributions": round(total_contributions, 2),
        "interest": 0,
        "real_value_adjustment": 0
    })
    
    for month in range(1, total_months + 1):
        # Add contribution
        current_balance += monthly_contribution
        total_contributions += monthly_contribution
        
        # Add interest (using effective/real rate)
        interest_earned = current_balance * monthly_rate
        current_balance += interest_earned
        
        # Record at end of each year
        if month % 12 == 0:
            year = month // 12
            yearly_data.append({
                "year": year,
                "balance": round(current_balance, 2),
                "contributions": round(total_contributions, 2),
                "interest": round(current_balance - total_contributions, 2)
            })
            
    return {
        "status": "completed",
        "parameters": {
            "initial_amount": initial_amount,
            "monthly_contribution": monthly_contribution,
            "rate": annual_interest_rate,
            "inflation_rate": inflation_rate,
            "effective_rate": round(effective_rate, 2),
            "years": years
        },
        "summary": {
            "final_balance": round(current_balance, 2),
            "total_contributions": round(total_contributions, 2),
            "total_interest_earned": round(current_balance - total_contributions, 2),
            "roi_percent": round(((current_balance - total_contributions) / total_contributions) * 100, 2) if total_contributions > 0 else 0
        },
        "yearly_breakdown": yearly_data
    }
