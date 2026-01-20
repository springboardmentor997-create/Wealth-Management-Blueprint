from fastapi import APIRouter, Depends, Query
from core.security import get_current_user
from core.database import get_session
from models.user import User
from sqlmodel import Session
from services.market_service import (
    search_stock, 
    get_stock
)
from services.recommendation_service import generate_recommendation

router = APIRouter(prefix="/market", tags=["Market"])

@router.get("/search")
def search(q: str, current_user: User = Depends(get_current_user)):
    """Search for stocks in both global and Indian markets"""
    return search_stock(q)

@router.get("/stock/{symbol}")
def stock(symbol: str, current_user: User = Depends(get_current_user)):
    """Get stock data from either global or Indian market (auto-detect)"""
    return get_stock(symbol)

@router.get("/global/quote/{symbol}")
def global_quote(symbol: str, current_user: User = Depends(get_current_user)):
    """Get global stock quote (mapped to unified get_stock)"""
    return get_stock(symbol)

@router.get("/india/search")
def india_search(q: str = Query(..., min_length=1), current_user: User = Depends(get_current_user)):
    """Search for Indian stocks"""
    # Use unified search, potentially filtering could be added later if needed
    return search_stock(q)

@router.get("/india/stock/{symbol}")
def india_stock(symbol: str, res_type: str = Query("num", pattern="^(num|csv)$"), current_user: User = Depends(get_current_user)):
    """Get Indian stock data"""
    # Ensure .NS suffix if missing for explicit India endpoint
    target = symbol if symbol.endswith(".NS") or symbol.endswith(".BO") or "." in symbol else f"{symbol}.NS"
    return get_stock(target)

@router.get("/india/stocks")
def india_stocks(symbols: str = Query(..., min_length=1), res_type: str = Query("num", pattern="^(num|csv)$"), current_user: User = Depends(get_current_user)):
    """Get multiple Indian stocks (comma-separated symbols)"""
    symbol_list = [s.strip() for s in symbols.split(',')]
    results = {}
    for sym in symbol_list:
        target = sym if sym.endswith(".NS") or sym.endswith(".BO") or "." in sym else f"{sym}.NS"
        results[sym] = get_stock(target)
    return results

@router.get("/recommend/{symbol}")
def recommend(symbol: str, current_user: User = Depends(get_current_user)):
    """Generate investment recommendation for a stock"""
    stock_data = get_stock(symbol)
    if stock_data and "error" not in stock_data:
        # Extract data if it's wrapped in a 'data' field
        data_for_recommendation = stock_data.get("data", stock_data)
        rec = generate_recommendation(data_for_recommendation)
    else:
        rec = "HOLD"
    
    # Extract price and other info
    stock_info = stock_data.get("data", stock_data) if stock_data else {}
    
    return {
        "symbol": symbol,
        "recommendation": rec,
        "current_price": stock_info.get("price", "N/A"),
        "pe_ratio": stock_info.get("pe_ratio", "N/A"),
        "dividend_yield": f"{stock_info.get('dividend_yield', 0)}%",
        "market_cap": stock_info.get("market_cap", "N/A"),
        "suggested_allocation": {
            "stocks": 40,
            "mutual_funds": 35,
            "bonds": 20,
            "cash": 5
        },
        "stock_data": stock_info
    }
