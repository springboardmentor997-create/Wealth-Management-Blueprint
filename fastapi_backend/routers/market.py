
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import yfinance as yf
import random

from database import get_db
from auth import get_current_user
from models import User
from market_service import MarketDataService
from schemas import MarketIndex, MarketNews, MarketUpdateResponse

router = APIRouter(prefix="/api/market", tags=["market"])

@router.get("/indices", response_model=List[MarketIndex])
async def get_market_indices(current_user: User = Depends(get_current_user)):
    """Get major market indices"""
    indices = [
        {"symbol": "^GSPC", "name": "S&P 500"},
        {"symbol": "^DJI", "name": "Dow Jones"},
        {"symbol": "^IXIC", "name": "NASDAQ"},
        {"symbol": "BTC-USD", "name": "Bitcoin"},
    ]
    
    results = []
    for index in indices:
        try:
            ticker = yf.Ticker(index["symbol"])
            # Fast way to get current price
            history = ticker.history(period="1d")
            if not history.empty:
                current_price = history['Close'].iloc[-1]
                prev_close = history['Open'].iloc[0] # Approximation for daily change
                change = current_price - prev_close
                change_percent = (change / prev_close) * 100
                
                results.append(MarketIndex(
                    name=index["name"],
                    symbol=index["symbol"],
                    price=float(current_price),
                    change=float(change),
                    change_percent=float(change_percent)
                ))
        except Exception as e:
            print(f"Error fetching {index['symbol']}: {e}")
            # Fallback mock data if API fails
            results.append(MarketIndex(
                name=index["name"],
                symbol=index["symbol"],
                price=0.0,
                change=0.0,
                change_percent=0.0
            ))
            
    return results

@router.get("/news", response_model=List[MarketNews])
async def get_market_news(current_user: User = Depends(get_current_user)):
    """Get financial news (Mock data for now as yfinance news is limited/unreliable)"""
    # In a real app, use a news API like NewsAPI.org or Alpha Vantage
    news = [
        {
            "id": 1,
            "title": "Market Rally Continues as Inflation Data Improves",
            "source": "Financial Times",
            "time": "2 hours ago",
            "sentiment": "positive"
        },
        {
            "id": 2,
            "title": "Tech Stocks Face Volatility Amid Earnings Season",
            "source": "Bloomberg",
            "time": "4 hours ago",
            "sentiment": "neutral"
        },
        {
            "id": 3,
            "title": "Federal Reserve Signals Potential Rate Cuts",
            "source": "WSJ",
            "time": "6 hours ago",
            "sentiment": "positive"
        },
        {
            "id": 4,
            "title": "Global Supply Chain Issues Persist in Manufacturing",
            "source": "Reuters",
            "time": "8 hours ago",
            "sentiment": "negative"
        }
    ]
    return [MarketNews(**n) for n in news]

@router.post("/update-prices", response_model=MarketUpdateResponse)
async def update_prices(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Trigger update of all portfolio prices"""
    success = MarketDataService.update_portfolio_prices(db)
    if success:
        return {"message": "Prices updated successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to update prices")
