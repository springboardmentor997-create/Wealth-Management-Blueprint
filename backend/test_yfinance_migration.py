import sys
import os

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.market_service import get_stock

def test_migration():
    print("Testing Market API Migration to yfinance...")
    
    # Test 1: US Stock
    symbol_us = "AAPL"
    print(f"\nFetching {symbol_us}...")
    data_us = get_stock(symbol_us)
    print(f"Result: {data_us}")
    
    if data_us and data_us.get("price", 0) > 0 and data_us.get("market") == "GLOBAL":
        print("✅ US Stock Fetch Success")
    else:
        print("❌ US Stock Fetch Failed")

    # Test 2: Indian Stock (Auto-suffix)
    symbol_in = "RELIANCE"
    print(f"\nFetching {symbol_in}...")
    data_in = get_stock(symbol_in)
    print(f"Result: {data_in}")

    if data_in and data_in.get("price", 0) > 0 and ".NS" in data_in.get("symbol", ""):
        print("✅ Indian Stock Fetch Success (Auto-suffix)")
    else:
        print("❌ Indian Stock Fetch Failed")

if __name__ == "__main__":
    test_migration()
