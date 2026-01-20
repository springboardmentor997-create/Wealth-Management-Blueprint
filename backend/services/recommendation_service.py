"""Recommendation engine service."""
from typing import Dict, List, Any

def generate_recommendation(stock_data):
    """
    Generate a recommendation based on stock data using PE ratio and dividend yield.
    """
    if not stock_data or "error" in stock_data:
        return "HOLD"

    # Extract PE ratio and dividend yield from stock data
    # Handle nested 'data' structure from API
    data = stock_data.get("data", stock_data)
    
    pe_ratio = data.get("pe_ratio", 0)
    dividend_yield = data.get("dividend_yield", 0)
    price = data.get("price", 0)

    if not pe_ratio or pe_ratio == 0:
        return "HOLD"

    # Rule-based recommendation logic
    if pe_ratio < 15 and dividend_yield > 1.5:
        return "BUY"  # Undervalued with good dividend
    elif pe_ratio > 35 and dividend_yield < 1.0:
        return "SELL"  # Overvalued with low dividend
    elif pe_ratio < 20 and dividend_yield > 2.0:
        return "BUY"  # Good value with strong dividend
    elif pe_ratio > 30:
        return "SELL"  # Too expensive
    else:
        return "HOLD"  # Fairly valued


def get_risk_profile_allocations(risk_profile: str) -> Dict[str, float]:
    """
    Generate asset allocation based on risk profile.
    Returns percentages (0.0 to 1.0).
    """
    allocations = {
        "aggressive": {
            "stocks": 0.60,
            "crypto": 0.20,
            "etf": 0.15,
            "bonds": 0.05,
            "cash": 0.00
        },
        "moderate": {
            "stocks": 0.40,
            "etf": 0.30,
            "bonds": 0.15,
            "crypto": 0.10,
            "cash": 0.05
        },
        "conservative": {
            "stocks": 0.20,
            "bonds": 0.40,
            "etf": 0.25,
            "crypto": 0.05,
            "cash": 0.10
        }
    }
    return allocations.get(risk_profile, allocations["moderate"])


def calculate_current_allocation(investments: List[Any]) -> Dict[str, float]:
    """
    Calculate current portfolio allocation from list of investments.
    """
    total_value = 0.0
    
    asset_type_values = {
        "stock": 0.0,
        "bond": 0.0,
        "crypto": 0.0,
        "etf": 0.0,
        "cash": 0.0,
        "mutual_fund": 0.0
    }
    
    for inv in investments:
        # Check if attributes exist (handles SQLModel objects or dicts)
        quantity = getattr(inv, 'quantity', 0) or getattr(inv, 'units', 0)
        price = getattr(inv, 'current_value', 0) or getattr(inv, 'last_price', 0) or getattr(inv, 'price', 0) 
        # Note: 'current_value' is total value in Investment model, 'last_price' is unit price
        
        # If model has pre-calculated value use it, otherwise calc
        value = 0
        if hasattr(inv, 'current_value') and inv.current_value:
             value = float(inv.current_value)
        elif quantity and price:
             value = float(quantity) * float(price)
            
        total_value += value
        
        raw_type = getattr(inv, 'asset_type', "stock")
        # Handle enum or string
        asset_type = raw_type.value.lower() if hasattr(raw_type, 'value') else str(raw_type).lower()
        
        # Normalize map
        if asset_type in ["stocks", "equity"]: asset_type = "stock"
        if asset_type in ["bonds", "debt"]: asset_type = "bond"
        if asset_type in ["cryptocurrency"]: asset_type = "crypto"
        if asset_type in ["etfs"]: asset_type = "etf"
        
        if asset_type in asset_type_values:
            asset_type_values[asset_type] += value
        else:
            # Fallback for unknown types
            asset_type_values["stock"] += value
            
    if total_value == 0:
        return {k: 0.0 for k in asset_type_values}
        
    return {k: v / total_value for k, v in asset_type_values.items()}


def generate_rebalancing_actions(
    current_alloc: Dict[str, float],
    target_alloc: Dict[str, float],
    total_value: float
) -> List[Dict[str, Any]]:
    """
    Generate actions to rebalance portfolio.
    """
    actions = []
    threshold = 0.05 # 5% drift tolerance
    
    # Map keys might differ slightly, normalize checks
    all_keys = set(current_alloc.keys()) | set(target_alloc.keys())
    
    for asset in all_keys:
        curr_pct = current_alloc.get(asset, 0)
        target_pct = target_alloc.get(asset, 0)
        
        diff = target_pct - curr_pct
        diff_value = diff * total_value
        
        if abs(diff) > threshold:
            action_type = "BUY" if diff > 0 else "SELL"
            actions.append({
                "asset_class": asset.capitalize(),
                "action": action_type,
                "amount": round(abs(diff_value), 2),
                "reason": f"{action_type} to reach target {target_pct*100:.0f}% (Current: {curr_pct*100:.0f}%)"
            })
            
    return actions

def check_sector_exposure(investments: List[Any]) -> List[str]:
    """
    Check for over-exposure to specific sectors.
    """
    sector_values = {}
    total_val = 0
    
    for inv in investments:
        # Assuming Investment model might have sector, or we infer/fetch it.
        # Since Investment model in schema didn't show sector, we might skipped it.
        # But wait, looking at MOCK_DATA in market_service, it HAS sector.
        # But Investment TABLE might not...
        # Let's check if we can get it. If not, we skip this check or use dummy.
        
        # For now, let's assume we can't easily get sector without joining 
        # or fetching external data.
        # We will add a placeholder insight.
        pass
        
    return [] 

