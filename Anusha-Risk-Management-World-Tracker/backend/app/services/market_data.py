import yfinance as yf
import requests
import os
from typing import Optional, Dict, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY", "")
YAHOO_FINANCE_ENABLED = os.getenv("YAHOO_FINANCE_ENABLED", "true").lower() == "true"

async def get_stock_price(symbol: str) -> Optional[Dict[str, Any]]:
    """
    Fetch current stock price using Yahoo Finance or Alpha Vantage
    """
    try:
        if YAHOO_FINANCE_ENABLED:
            return await get_price_yahoo(symbol)
        elif ALPHA_VANTAGE_API_KEY:
            return await get_price_alpha_vantage(symbol)
        else:
            logger.warning("No market data provider configured")
            return None
    except Exception as e:
        logger.error(f"Error fetching price for {symbol}: {str(e)}")
        return None

async def get_price_yahoo(symbol: str) -> Optional[Dict[str, Any]]:
    """
    Fetch stock price using Yahoo Finance
    """
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        if 'currentPrice' in info:
            price = info['currentPrice']
        elif 'regularMarketPrice' in info:
            price = info['regularMarketPrice']
        elif 'previousClose' in info:
            price = info['previousClose']
        else:
            return None
        
        return {
            "symbol": symbol,
            "price": float(price),
            "currency": info.get("currency", "USD"),
            "source": "yahoo_finance",
            "timestamp": datetime.utcnow().isoformat(),
            "change": info.get("regularMarketChange", 0),
            "change_percent": info.get("regularMarketChangePercent", 0)
        }
    except Exception as e:
        logger.error(f"Yahoo Finance error for {symbol}: {str(e)}")
        return None

async def get_price_alpha_vantage(symbol: str) -> Optional[Dict[str, Any]]:
    """
    Fetch stock price using Alpha Vantage API
    """
    if not ALPHA_VANTAGE_API_KEY:
        return None
    
    try:
        url = "https://www.alphavantage.co/query"
        params = {
            "function": "GLOBAL_QUOTE",
            "symbol": symbol,
            "apikey": ALPHA_VANTAGE_API_KEY
        }
        
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        
        if "Global Quote" not in data:
            return None
        
        quote = data["Global Quote"]
        price = float(quote.get("05. price", 0))
        
        if price == 0:
            return None
        
        return {
            "symbol": symbol,
            "price": price,
            "currency": "USD",
            "source": "alpha_vantage",
            "timestamp": datetime.utcnow().isoformat(),
            "change": float(quote.get("09. change", 0)),
            "change_percent": float(quote.get("10. change percent", 0).rstrip("%"))
        }
    except Exception as e:
        logger.error(f"Alpha Vantage error for {symbol}: {str(e)}")
        return None

async def update_investment_prices(db, Investment):
    """
    Update prices for all investments in the database
    """
    investments = db.query(Investment).filter(
        Investment.last_price_at.is_(None)
    ).all()
    
    updated_count = 0
    for investment in investments:
        price_data = await get_stock_price(investment.symbol)
        if price_data:
            investment.last_price = price_data["price"]
            investment.current_value = float(investment.units) * price_data["price"]
            investment.last_price_at = datetime.utcnow()
            updated_count += 1
    
    db.commit()
    return updated_count

