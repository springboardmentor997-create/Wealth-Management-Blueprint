"""Market data service for stock information lookups - Tiered Strategy: Finnhub -> yfinance -> Mock."""

import requests
import yfinance as yf
from core.config import settings
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# -------- API CONFIGURATION --------
FINNHUB_URL = "https://finnhub.io/api/v1"

# -------- MOCK DATA FOR FINAL FALLBACK --------
MOCK_STOCKS = {
    "TCS": {
        "market": "INDIA", "symbol": "TCS.NS", "price": 3850.50, "change": "+125.50", "change_percent": "+3.36%",
        "last_updated": "2026-01-12", "name": "Tata Consultancy Services"
    },
    "RELIANCE": {
        "market": "INDIA", "symbol": "RELIANCE.NS", "price": 2895.30, "change": "+95.80", "change_percent": "+3.41%",
        "last_updated": "2026-01-12", "name": "Reliance Industries"
    },
    "AAPL": {
        "market": "US", "symbol": "AAPL", "price": 185.50, "change": "+2.50", "change_percent": "+1.36%",
        "last_updated": "2026-01-12", "name": "Apple Inc."
    }
}

def get_finnhub_quote(symbol: str):
    """Fetch quote from Finnhub (Primary)"""
    if not settings.FINNHUB_API_KEY:
        return None
        
    try:
        # Finnhub requires .NS for NSE stocks but often fails on free tier
        params = {"symbol": symbol, "token": settings.FINNHUB_API_KEY}
        res = requests.get(f"{FINNHUB_URL}/quote", params=params, timeout=5)
        
        if res.status_code == 403:
             # Likely restricted asset class (e.g. India on free tier)
             return None
        if res.status_code != 200:
            return None
            
        data = res.json()
        if data.get("c", 0) == 0:
            return None

        change = data.get("d", 0)
        price = data.get("c", 0)
        change_p = data.get("dp", 0)
        
        return {
            "market": "GLOBAL",
            "symbol": symbol,
            "price": float(price),
            "change": round(float(change), 2) if change else 0,
            "change_percent": f"{round(float(change_p), 2)}%" if change_p else "0%",
            "last_updated": datetime.fromtimestamp(data.get("t", 0)).strftime("%Y-%m-%d") if data.get("t") else "N/A",
            "high": data.get("h"),
            "low": data.get("l"),
            "open": data.get("o"),
            "source": "finnhub"
        }
    except Exception as e:
        logger.error(f"Finnhub error for {symbol}: {e}")
        return None

def get_yfinance_quote(symbol: str):
    """Fetch quote from yfinance (Fallback - Excellent for India/Global)"""
    try:
        # Auto-append .NS for India if it looks like an Indian symbol (CAPS, no dot)
        # This is a heuristic.
        target_symbol = symbol
        if not "." in symbol and len(symbol) >= 3:
             # Quick check: if finnhub failed, maybe it's india?
             # We can try as is, then try .NS
             pass
        
        ticker = yf.Ticker(target_symbol)
        # Fast history check
        hist = ticker.history(period="1d")
        
        if hist.empty and not symbol.endswith(".NS"):
            target_symbol = f"{symbol}.NS"
            ticker = yf.Ticker(target_symbol)
            hist = ticker.history(period="1d")
            
        if hist.empty:
            return None
            
        current_price = float(hist["Close"].iloc[-1])
        open_price = float(hist["Open"].iloc[0])
        change = current_price - open_price
        change_p = (change / open_price) * 100
        
        info = ticker.info # Can be slow, but useful for metadata
        name = info.get("longName", target_symbol)
        
        return {
            "market": "INDIA" if target_symbol.endswith(".NS") else "GLOBAL",
            "symbol": target_symbol,
            "price": current_price,
            "change": round(change, 2),
            "change_percent": f"{round(change_p, 2)}%",
            "last_updated": datetime.now().strftime("%Y-%m-%d"),
            "name": name,
            "source": "yfinance"
        }
    except Exception as e:
        logger.error(f"yfinance error for {symbol}: {e}")
        return None

def get_nsepy_quote(symbol: str):
    """Fetch quote from NSEpy (3rd Layer - India Only)"""
    try:
        from nsepy import get_quote
        # NSEpy expects symbol without .NS
        clean_symbol = symbol.replace(".NS", "").replace(".BO", "")
        
        # NSEpy get_quote returns live data dictionary
        data = get_quote(clean_symbol)
        
        if not data or "data" not in data or not data["data"]:
             return None
             
        # The data structure from nsepy live quote is complex, usually:
        # data['data'][0]['lastPrice']
        # We need to be careful with parsing.
        
        # NOTE: NSEpy live quote is known to be flaky as it scrapes. 
        # We map what we can.
        series_data = data["data"][0] 
        last_price = float(series_data.get("lastPrice", "0").replace(",", ""))
        p_close = float(series_data.get("previousClose", "0").replace(",", ""))
        
        change = last_price - p_close
        change_p = (change / p_close) * 100 if p_close else 0
        
        return {
            "market": "INDIA",
            "symbol": f"{clean_symbol}.NS", # Normalize back to .NS for internal consistency
            "price": last_price,
            "change": round(change, 2),
            "change_percent": f"{round(change_p, 2)}%",
            "last_updated": datetime.now().strftime("%Y-%m-%d"),
            "name": series_data.get("companyName", clean_symbol),
            "source": "nsepy"
        }
    except ImportError:
        logger.error("nsepy not installed")
        return None
    except Exception as e:
        logger.error(f"NSEpy error for {symbol}: {e}")
        return None

def get_twelve_data_quote(symbol: str):
    """Fetch quote from Twelve Data (4th Layer - Reliable Fallback)"""
    if not settings.TWELVE_DATA_API_KEY:
        return None

    try:
        # Twelve Data uses strict tickers. For India, it often uses symbol (TCS) and exchange (NSE)
        # We can try "symbol:exchange" format implicitly or just symbol.
        # Check if .NS
        query_symbol = symbol
        exchange = ""
        if symbol.endswith(".NS"):
            query_symbol = symbol.replace(".NS", "")
            exchange = "NSE"
        elif symbol.endswith(".BO"):
             query_symbol = symbol.replace(".BO", "")
             exchange = "BSE"
        
        # We construct symbol param. If exchange is known, use it.
        # Twelve Data format: symbol=TCS&exchange=NSE or symbol=TCS:NSE (less common in some endpoints)
        # Quote endpoint supports symbol=TCS&exchange=NSE
        
        url = "https://api.twelvedata.com/quote"
        params = {"symbol": query_symbol, "apikey": settings.TWELVE_DATA_API_KEY}
        if exchange:
            params["exchange"] = exchange
            
        res = requests.get(url, params=params, timeout=8)
        
        if res.status_code != 200:
            return None
            
        data = res.json()
        if "code" in data and data["code"] != 200:
             return None
             
        # Extract data
        # { "symbol": "AAPL", "name": "Apple Inc", "datetime": "2021-09-02", "open": "153.87", "high": "154.72", "low": "152.40", "close": "153.65", "volume": "71171317", "previous_close": "152.51", "change": "1.14", "percent_change": "0.75", "average_volume": "64942369", "is_market_open": false }
        
        price = float(data.get("close", 0))
        change = float(data.get("change", 0))
        change_p = float(data.get("percent_change", 0))
        
        return {
            "market": "INDIA" if exchange in ["NSE", "BSE"] else "GLOBAL",
            "symbol": symbol, # Keep strict internal ID
            "price": price,
            "change": round(change, 2),
            "change_percent": f"{round(change_p, 2)}%",
            "last_updated": datetime.now().strftime("%Y-%m-%d"),
            "name": data.get("name", symbol),
            "source": "twelve_data"
        }
    except Exception as e:
        logger.error(f"Twelve Data error for {symbol}: {e}")
        return None

def get_alpha_vantage_quote(symbol: str):
    """Fetch quote from Alpha Vantage (High Reliability)"""
    if not settings.ALPHA_VANTAGE_API_KEY:
        return None
        
    try:
        url = "https://www.alphavantage.co/query"
        params = {
            "function": "GLOBAL_QUOTE",
            "symbol": symbol,
            "apikey": settings.ALPHA_VANTAGE_API_KEY
        }
        res = requests.get(url, params=params, timeout=8)
        
        if res.status_code != 200:
            return None
            
        data = res.json()
        quote = data.get("Global Quote", {})
        
        if not quote:
            return None
            
        # Parse Alpha Vantage specific format
        price = float(quote.get("05. price", 0))
        change = float(quote.get("09. change", 0))
        change_str = quote.get("10. change percent", "0%").replace("%", "")
        
        return {
            "market": "GLOBAL",
            "symbol": symbol,
            "price": price,
            "change": round(change, 2),
            "change_percent": f"{round(float(change_str), 2)}%",
            "last_updated": quote.get("07. latest trading day", datetime.now().strftime("%Y-%m-%d")),
            "source": "alpha_vantage"
        }
    except Exception as e:
        logger.error(f"Alpha Vantage error for {symbol}: {e}")
        return None

def get_stock(symbol: str):
    """
    Tiered Strategy (Multi-Layer):
    1. Finnhub (Fast, Official)
    2. Alpha Vantage (Reliable, Global)
    3. yfinance (Free, robust for India)
    4. NSEpy (Direct NSE Library)
    5. Twelve Data (Reliable API Fallback)
    6. Mock Data (Safety)
    """
    # 1. Try Finnhub
    data = get_finnhub_quote(symbol)
    if data:
        return data
        
    # 2. Try Alpha Vantage
    data = get_alpha_vantage_quote(symbol)
    if data:
        return data

    # 3. Try yfinance
    data = get_yfinance_quote(symbol)
    if data:
        return data

    # 4. Try NSEpy (India Only)
    if ".NS" in symbol or (symbol.isupper() and "." not in symbol):
        data = get_nsepy_quote(symbol)
        if data:
             return data
    
    # 5. Try Twelve Data
    data = get_twelve_data_quote(symbol)
    if data:
        return data
        
    # 6. Mock Data
    logger.warning(f"All APIs failed for {symbol}. Using Mock Data.")
    base_sym = symbol.replace(".NS", "")
    if base_sym in MOCK_STOCKS:
        return MOCK_STOCKS[base_sym]
    if symbol in MOCK_STOCKS:
        return MOCK_STOCKS[symbol]
        
    return {"error": "Symbol not found", "symbol": symbol}



def search_stock(query: str):
    # Simple pass-through for now as generic search is complex to unify
    # We essentially check if the quote exists.
    data = get_stock(query)
    if "error" not in data:
        return {"results": [{"symbol": data["symbol"], "name": data.get("name", data["symbol"]), "type": "Equity"}]}
    return {"results": []}

