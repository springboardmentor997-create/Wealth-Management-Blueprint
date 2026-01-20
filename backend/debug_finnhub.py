import sys
import os
import requests
from dotenv import load_dotenv

load_dotenv()
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from core.config import settings

def debug_finnhub():
    key = settings.FINNHUB_API_KEY
    if not key:
        print("No API Key")
        return

    symbols = ["AAPL", "TCS.NS", "RELIANCE.NS", "TCS.BO"]
    for sym in symbols:
        print(f"--- Fetching {sym} ---")
        url = "https://finnhub.io/api/v1/quote"
        params = {"symbol": sym, "token": key}
        try:
            res = requests.get(url, params=params)
            print(f"Status: {res.status_code}")
            print(f"Body: {res.text}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    debug_finnhub()
