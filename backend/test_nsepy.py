import sys
import os

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.market_service import get_nsepy_quote

def test_nsepy():
    print("Testing NSEpy Integration...")
    
    # Test 1: Indian Stock
    symbol_in = "TCS"
    print(f"\nFetching {symbol_in}...")
    try:
        data_in = get_nsepy_quote(symbol_in)
        print(f"Result: {data_in}")
        
        if data_in and data_in.get("market") == "INDIA":
            print("[OK] NSEpy fetched data successfully")
        else:
            print("[WARN] NSEpy returned None (Possible site change or market closed issue)")
    except Exception as e:
        print(f"[FAIL] NSEpy crashed: {e}")

if __name__ == "__main__":
    test_nsepy()
