import sys
import os
from dotenv import load_dotenv

# Load env before importing app modules
load_dotenv()

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.market_service import get_stock
from core.config import settings

def test_finnhub():
    print("Testing Finnhub Integration...")
    print(f"Finnhub Key Present: {'Yes' if settings.FINNHUB_API_KEY else 'No'}")
    
    # Test 1: US Stock
    symbol_us = "AAPL"
    print(f"\nFetching {symbol_us}...")
    data_us = get_stock(symbol_us)
    print(f"Result: {data_us}")
    
    # Test 2: Indian Stock
    symbol_in = "TCS.NS" # Explicit suffix
    print(f"\nFetching {symbol_in}...")
    data_in = get_stock(symbol_in)
    print(f"Result: {data_in}")

    # Test 3: Indian Stock (Auto-suffix check if implemented or fallback)
    symbol_in_raw = "RELIANCE" 
    print(f"\nFetching {symbol_in_raw}...")
    data_in_2 = get_stock(symbol_in_raw)
    print(f"Result: {data_in_2}")

if __name__ == "__main__":
    test_finnhub()
