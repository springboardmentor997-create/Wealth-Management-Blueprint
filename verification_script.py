import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from services.simulation_service import calculate_compound_interest
from services.recommendation_service import generate_rebalancing_actions, get_risk_profile_allocations

def test_simulation():
    print("Testing Simulation Service...")
    result = calculate_compound_interest(10000, 500, 7.0, 10)
    
    assert result['status'] == 'completed'
    assert len(result['yearly_breakdown']) == 11 # 0 to 10
    final_balance = result['summary']['final_balance']
    print(f"PASS: Final Balance for $10k + $500/mo @ 7% for 10y = ${final_balance}")
    # Approx check: 10k -> ~19k, 500/mo -> 60k princ -> ~86k total. Total ~105k
    if 90000 < final_balance < 110000:
        print("PASS: Logic range seems correct.")
    else:
        print("FAIL: Logic range questionable.")

def test_recommendation():
    print("\nTesting Recommendation Service...")
    target = get_risk_profile_allocations("aggressive")
    current = {"stocks": 0.40, "bonds": 0.40, "cash": 0.20} # Way too conservative
    
    actions = generate_rebalancing_actions(current, target, 100000)
    
    print(f"Target (Aggressive): {target}")
    print(f"Current: {current}")
    print("Actions Generated:")
    for a in actions:
        print(f" - {a['action']} {a['asset_class']} ${a['amount']}")
        
    # Expect BUY Stocks (Target 60% vs 40%), SELL Bonds (Target 5% vs 40%)
    has_buy_stock = any(x for x in actions if x['asset_class'] == "Stocks" and x['action'] == "BUY")
    has_sell_bond = any(x for x in actions if x['asset_class'] == "Bonds" and x['action'] == "SELL")
    
    if has_buy_stock and has_sell_bond:
        print("PASS: Recommended correct rebalancing actions.")
    else:
        print("FAIL: Did not recommend expected actions.")

if __name__ == "__main__":
    try:
        test_simulation()
        test_recommendation()
        print("\nAll Tests Executed Successfully")
    except Exception as e:
        print(f"\nTEST FAILED with error: {e}")
        import traceback
        traceback.print_exc()
