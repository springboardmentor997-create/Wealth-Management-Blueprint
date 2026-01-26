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
        # Don't auto-append .NS if it's an index or already has a suffix
        target_symbol = symbol
        if not symbol.startswith("^") and not "." in symbol and len(symbol) >= 3:
             # Heuristic for Indian stocks
             pass # We check history first for base symbol
        
        ticker = yf.Ticker(target_symbol)
        
        # Fast history check
        # reliable for price
        hist = ticker.history(period="1d")
        
        # If empty, try appending .NS (only if not an index)
        if hist.empty and not symbol.endswith(".NS") and not symbol.startswith("^"):
            target_symbol = f"{symbol}.NS"
            ticker = yf.Ticker(target_symbol)
            hist = ticker.history(period="1d")
            
        if hist.empty:
            return None
            
        # Extract Price Data
        current_price = float(hist["Close"].iloc[-1])
        open_price = float(hist["Open"].iloc[0])
        # Indices sometimes have 0 open price in yfinance history?
        # Use 'Previous Close' from info if available, or just fallback
        
        change = current_price - open_price
        change_p = (change / open_price) * 100 if open_price != 0 else 0
        
        # Extract Metadata (Info can be slow, but useful)
        # Use fast_info if available (newer yfinance)
        info = {}
        try:
            info = ticker.info
        except:
            pass # Info fetch failed, not critical for price

        name = info.get("shortName") or info.get("longName") or target_symbol
        market_cap = info.get("marketCap", "N/A")
        pe_ratio = info.get("trailingPE", "N/A")
        dividend_yield = info.get("dividendYield", "0")
        if dividend_yield != "0": 
             dividend_yield = round(float(dividend_yield) * 100, 2)

        return {
            "market": "INDIA" if target_symbol.endswith(".NS") or target_symbol == "^NSEI" or target_symbol == "^BSESN" else "GLOBAL",
            "symbol": target_symbol,
            "price": current_price,
            "change": round(change, 2),
            "change_percent": f"{round(change_p, 2)}%",
            "last_updated": datetime.now().strftime("%Y-%m-%d"),
            "name": name,
            "market_cap": market_cap,
            "pe_ratio": pe_ratio,
            "dividend_yield": dividend_yield,
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

# -------- ALIASES --------
COMMON_INDIAN_ALIASES = {
    "TCS": "TCS.NS",
    "RELIANCE": "RELIANCE.NS",
    "INFY": "INFY.NS",
    "HDFCBANK": "HDFCBANK.NS",
    "ICICIBANK": "ICICIBANK.NS",
    "SBIN": "SBIN.NS",
    "WIPRO": "WIPRO.NS",
    "BHARTIARTL": "BHARTIARTL.NS",
    "ITC": "ITC.NS",
    "KOTAKBANK": "KOTAKBANK.NS",
    "LT": "LT.NS",
    "AXISBANK": "AXISBANK.NS",
    "HINDUNILVR": "HINDUNILVR.NS"
}

def get_stock(symbol: str):
    """
    Tiered Strategy (Multi-Layer) - INDIA FIRST:
    1. Auto-append .NS for Indian context
    2. yfinance (Primary for India)
    3. NSEpy (Backup for India)
    4. Global Fallbacks
    """
    # 0. Check Aliases (Keep existing)
    if symbol in COMMON_INDIAN_ALIASES:
        symbol = COMMON_INDIAN_ALIASES[symbol]

    # 1. FORCE INDIAN CONTEXT: If no suffix provided, assume NSE (.NS)
    # Exclude indices (^) or already suffixed symbols
    if not symbol.startswith("^") and "." not in symbol:
        symbol = f"{symbol}.NS"

    # 1.5 Special Handling for Indices (Force yfinance)
    if symbol.startswith("^"):
        data = get_yfinance_quote(symbol)
        if data:
             return data

    # 2. Try yfinance (Primary for India)
    data = get_yfinance_quote(symbol)
    if data:
        return data

    # 3. Try NSEpy (India Only)
    if ".NS" in symbol:
        data = get_nsepy_quote(symbol)
        if data:
             return data

    # 4. Fallbacks (Finnhub/AlphaVantage) - Lower priority now
    data = get_finnhub_quote(symbol)
    if data:
        return data
        
    data = get_alpha_vantage_quote(symbol)
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
    # Handle common index aliases manually for better UX
    q_upper = query.upper()
    if q_upper == "NIFTY" or q_upper == "NIFTY 50":
        return {"results": [{"symbol": "^NSEI", "name": "NIFTY 50", "type": "Index"}]}
    if q_upper == "SENSEX":
        return {"results": [{"symbol": "^BSESN", "name": "S&P BSE SENSEX", "type": "Index"}]}

    # Simple pass-through for now as generic search is complex to unify
    # We essentially check if the quote exists.
    data = get_stock(query)
    if "error" not in data:
        return {"results": [{"symbol": data["symbol"], "name": data.get("name", data["symbol"]), "type": "Equity"}]}
    return {"results": []}


def get_bulk_quotes(symbols: list[str]):
    """
    Fetch multiple quotes efficiently using yfinance bulk download.
    This is much faster than sequential calls.
    """
    if not symbols:
        return {}
    
    # Ensure all symbols are compliant (add .NS if missing)
    validated_symbols = []
    for s in symbols:
        if not s.startswith("^") and "." not in s:
             validated_symbols.append(f"{s}.NS")
        else:
             validated_symbols.append(s)

    # Safe Float Helper
    def safe_float(val):
        try:
            f = float(val)
            # Check for NaN (NaN != NaN) or infinite
            if f != f or f == float('inf') or f == float('-inf'):
                return 0.0
            return f
        except:
            return 0.0

    tickers_str = " ".join(validated_symbols)
    try:
        # Fetch current data
        # period="1d" gives us open/close for change calc
        # group_by='ticker' makes parsing easier
        # threads=True uses multi-threading
        data = yf.download(tickers_str, period="1d", group_by='ticker', threads=True, progress=False)
        
        results = {}
        
        # If only one symbol, the structure is different (DataFrame directly)
        if len(validated_symbols) == 1:
            sym = validated_symbols[0]
            if data.empty:
                return {sym: {"error": "No data"}}
            
            # Helper to extract data from single DF
            try:
                # yfinance sometimes returns MultiIndex columns. Accessing properly:
                # If columns are plain: Close, Open. 
                # If bulk but single ticker, it might still map to ticker.
                # Safer to check if 'Close' is in columns directly
                
                # Note: yfinance behavior varies by version. 
                if isinstance(data.columns,  object) and "Close" not in data.columns and sym in data:
                     # It's grouped by ticker despite being length 1? Rare but possible.
                     df = data[sym]
                else:
                     df = data

                current = safe_float(df["Close"].iloc[-1])
                prev = safe_float(df["Open"].iloc[0]) 
                
                change = current - prev
                if prev != 0:
                    change_p = (change / prev) * 100
                else:
                    change_p = 0.0
                
                results[sym] = {
                    "price": current,
                    "change": round(change, 2),
                    "change_percent": f"{round(change_p, 2)}%",
                    "last_updated": datetime.now().isoformat()
                }
            except Exception as e:
                logger.error(f"Error parsing bulk data for {sym}: {e}")
                results[sym] = {"error": "Parse error"}
                
        else:
            # Multi-level columns
            for sym in validated_symbols:
                try:
                    df = data[sym]
                    if df.empty:
                         results[sym] = {"error": "No data"}
                         continue
                         
                    current = safe_float(df["Close"].iloc[-1])
                    prev = safe_float(df["Open"].iloc[0])
                    
                    change = current - prev
                    if prev != 0:
                        change_p = (change / prev) * 100
                    else:
                        change_p = 0.0
                    
                    results[sym] = {
                        "price": current,
                        "change": round(change, 2),
                        "change_percent": f"{round(change_p, 2)}%",
                        "last_updated": datetime.now().isoformat()
                    }
                except KeyError:
                    # Symbol might be invalid
                    results[sym] = {"error": "Not found"}
                except Exception as e:
                    logger.error(f"Error parsing bulk data for {sym}: {e}")
                    results[sym] = {"error": "Parse error"}
                    
        return results

    except Exception as e:
        logger.error(f"Bulk fetch error: {e}")
        return {}


# -------- CURATED TOP ASSETS --------
TOP_ASSETS = {
    "stock": [
        "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS", 
        "SBIN.NS"
    ],
    "crypto": [
        "BTC-USD", "ETH-USD", "SOL-USD", "BNB-USD", "XRP-USD"
    ],
    "etf": [
        "NIFTYBEES.NS", "GOLDBEES.NS", "LIQUIDBEES.NS", "JUNIORBEES.NS", "BANKBEES.NS"
    ],
    "mutual_fund": [
        "^NSEI", "^BSESN", "^NSEBANK", "NIFTYBEES.NS", "BANKBEES.NS" # Proxies and broad ETFs
    ],
    "bond": [
        "^TNX" # US 10 Year Treasury (Reference)
    ]
}

# -------- FALLBACK DATA (Offline/Error Case) --------
FALLBACK_ASSETS = {
    "stock": [
        {"symbol": "RELIANCE.NS", "price": 2900.0, "change_percent": "+0.5%", "change": 15.0},
        {"symbol": "TCS.NS", "price": 3850.0, "change_percent": "+1.2%", "change": 45.0},
        {"symbol": "HDFCBANK.NS", "price": 1650.0, "change_percent": "-0.3%", "change": -5.0},
        {"symbol": "SBIN.NS", "price": 750.0, "change_percent": "+0.8%", "change": 6.0},
        {"symbol": "ITC.NS", "price": 435.0, "change_percent": "+0.2%", "change": 1.0},
    ],
    "crypto": [
        {"symbol": "BTC-USD", "price": 65000.0, "change_percent": "+2.5%", "change": 1500.0},
        {"symbol": "ETH-USD", "price": 3500.0, "change_percent": "+1.8%", "change": 60.0},
    ],
    "etf": [
        {"symbol": "NIFTYBEES.NS", "price": 240.0, "change_percent": "+0.4%", "change": 1.0},
        {"symbol": "GOLDBEES.NS", "price": 55.0, "change_percent": "+0.1%", "change": 0.05},
        {"symbol": "SPY", "price": 500.0, "change_percent": "+0.6%", "change": 3.0},
    ],
     "mutual_fund": [
        {"symbol": "^NSEI", "price": 22000.0, "change_percent": "+0.5%", "change": 110.0},
        {"symbol": "^BSESN", "price": 72000.0, "change_percent": "+0.4%", "change": 280.0},
    ],
    "bond": [
        {"symbol": "^TNX", "price": 4.2, "change_percent": "+0.0%", "change": 0.0},
    ]
}


def get_top_assets(asset_type: str):
    """
    Get top assets for a given category with live market data.
    Falls back to mock data if live fetch fails.
    """
    if asset_type not in TOP_ASSETS:
        return []
        
    symbols = TOP_ASSETS[asset_type]
    results = []
    
    try:
        # Use bulk fetch for efficiency
        quotes = get_bulk_quotes(symbols)
        
        for sym in symbols:
            if sym in quotes and "error" not in quotes[sym]:
                data = quotes[sym]
                results.append({
                    "symbol": sym,
                    "name": sym,
                    "price": data["price"],
                    "change_percent": data["change_percent"],
                    "change": data["change"]
                })
    except Exception as e:
        logger.error(f"Error fetching top assets for {asset_type}: {e}")
        # Proceed to fallback

    # If live data failed or returned very few results, use fallback
    if len(results) < 2:
        logger.info(f"Using fallback data for {asset_type} recommendations")
        fallback_list = FALLBACK_ASSETS.get(asset_type, [])
        
        # Avoid duplicates if some live data worked
        existing_syms = {r['symbol'] for r in results}
        for item in fallback_list:
            if item['symbol'] not in existing_syms:
                results.append(item)
            
    return results


