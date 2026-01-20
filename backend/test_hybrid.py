import sys
import os
from dotenv import load_dotenv

# Load env before importing app modules
load_dotenv()

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.market_service import get_stock
from core.config import settings

def test_hybrid():
    print("Testing Hybrid Market Strategy...")
    print(f"Finnhub Key Present: {'Yes' if settings.FINNHUB_API_KEY else 'No'}")
    
    # Test 1: US Stock (Should use Finnhub)
    symbol_us = "AAPL"
    print(f"\n1. Fetching US Stock ({symbol_us})...")
    data_us = get_stock(symbol_us)
    print(f"Result Source: {data_us.get('source')}")
    print(f"Price: {data_us.get('price')}")
    
    if data_us.get('source') == 'finnhub':
        print("[OK] US Stock via Finnhub Success")
    else:
        print(f"[WARN] US Stock via {data_us.get('source')} (Expected Finnhub)")

    # Test 2: Indian Stock (Should fail Finnhub 403, use yfinance)
    symbol_in = "TCS.NS"
    print(f"\n2. Fetching Indian Stock ({symbol_in})...")
    data_in = get_stock(symbol_in)
    print(f"Result Source: {data_in.get('source')}")
    print(f"Price: {data_in.get('price')}")

    if data_in.get('source') == 'yfinance':
        print("[OK] Indian Stock via yfinance Success (Fallback worked)")
    elif data_in.get('source') == 'finnhub':
        print("[INFO] Indian Stock via Finnhub (Unexpected but good!)")
    else:
        print(f"[FAIL] Indian Stock via {data_in.get('source')} (Expected yfinance)")

if __name__ == "__main__":
    test_hybrid()
