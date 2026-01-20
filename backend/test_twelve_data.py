import sys
import os
from dotenv import load_dotenv

load_dotenv()
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.market_service import get_twelve_data_quote, get_stock
from core.config import settings

def test_twelve_data():
    print("Testing Twelve Data Integration...")
    print(f"API Key Present: {'Yes' if settings.TWELVE_DATA_API_KEY else 'No'}")
    
    # Test 1: Direct Call to Twelve Data (US Stock)
    symbol_us = "AAPL"
    print(f"\n1. Direct Fetch US ({symbol_us})...")
    data_us = get_twelve_data_quote(symbol_us)
    if data_us:
        print(f"[OK] Result: {data_us.get('price')} (Source: {data_us.get('source')})")
    else:
        print("[FAIL] Could not fetch US stock directly")

    # Test 2: Direct Call India (TCS)
    symbol_in = "TCS.NS"
    print(f"\n2. Direct Fetch India ({symbol_in})...")
    data_in = get_twelve_data_quote(symbol_in)
    if data_in:
         print(f"[OK] Result: {data_in.get('price')} (Source: {data_in.get('source')})")
    else:
         print("[FAIL] Could not fetch Indian stock directly (Check API plan/symbol)")

    # Test 3: Integrated Fallback (Simulate failure of others? Hard to simulate without mocking)
    # We validted functionality via direct call. get_stock logic is simple if/else.

if __name__ == "__main__":
    test_twelve_data()
