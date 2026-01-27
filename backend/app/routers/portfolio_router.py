from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
import yfinance as yf
import requests
from typing import List, Dict, Any

# Internal Application Imports
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.investment import Investment 
from app.schemas.investment_schema import InvestmentCreate, InvestmentOut

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])

def get_usd_inr_rate():
    try:
        # Fetch USD to INR rate using Yahoo Finance
        # "INR=X" is the standard ticker for USD/INR exchange rate
        return float(yf.Ticker("INR=X").history(period="1d")['Close'].iloc[-1])
    except:
        return 84.0 # Safe fallback

# ---------------------------------------------------------
# 1. ADD INVESTMENT
# ---------------------------------------------------------
@router.post("/add", response_model=InvestmentOut, status_code=status.HTTP_201_CREATED)
def add_investment(
    investment: InvestmentCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add a new investment to the user's portfolio.
    """
    new_inv = Investment(
        **investment.model_dump(),
        user_id=current_user.id,
        current_value=investment.amount_invested  # Initially, value = cost
    )
    
    db.add(new_inv)
    db.commit()
    db.refresh(new_inv)
    return new_inv

# ---------------------------------------------------------
# 2. GET PORTFOLIO SUMMARY
# ---------------------------------------------------------
@router.get("/list") # Matches frontend URL '/portfolio/list'
def get_portfolio_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Calculate total portfolio metrics and return all holdings.
    """
    investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
    
    if not investments:
        return {
            "total_invested": 0,
            "current_value": 0,
            "total_gain": 0,
            "investments": []
        }

    total_invested = sum(inv.amount_invested for inv in investments)
    total_value = sum(inv.current_value for inv in investments) 
    
    return {
        "total_invested": round(total_invested, 2),
        "current_value": round(total_value, 2),
        "total_gain": round(total_value - total_invested, 2),
        "investments": investments
    }

# ---------------------------------------------------------
# 3. DELETE INVESTMENT
# ---------------------------------------------------------
@router.delete("/{investment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_investment(
    investment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inv = db.query(Investment).filter(
        Investment.id == investment_id, 
        Investment.user_id == current_user.id
    ).first()

    if not inv:
        raise HTTPException(status_code=404, detail="Investment not found")

    db.delete(inv)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# ---------------------------------------------------------
# 4. SYNC MARKET PRICES (✅ FIXED)
# ---------------------------------------------------------
@router.post("/sync-prices")
def sync_portfolio_prices(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    print(f"🚀 STARTING SYNC (5-Day Lookback) for User: {current_user.email}")
    
    investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
    updated_count = 0
    
    # 1. Get USD Rate (Robust)
    usd_rate = 84.0 
    try:
        usd_ticker = yf.Ticker("INR=X")
        # Fetch 5 days to be safe against weekends
        hist = usd_ticker.history(period="5d")
        if not hist.empty:
            usd_rate = float(hist['Close'].iloc[-1])
            print(f"💵 USD Rate fetched: {usd_rate}")
    except Exception as e:
        print(f"⚠️ USD Fetch failed, using default {usd_rate}")

    # 2. Loop through assets
    for asset in investments:
        if not asset.asset_name or len(asset.asset_name) > 20: 
            continue

        try:
            print(f"🔍 Checking: {asset.asset_name}...")
            ticker = yf.Ticker(asset.asset_name)
            
            # ✅ FIX: Fetch 5 days instead of 1 day
            # This handles weekends, holidays, and market-closed hours
            hist = ticker.history(period="5d")
            
            if hist.empty:
                print(f"   ❌ No data found for {asset.asset_name} (Try checking the symbol spelling)")
                continue

            # ✅ Take the LAST available closing price (Friday's price if today is Sunday)
            raw_price = float(hist['Close'].iloc[-1])
            
            # 3. Currency Check (Manual Logic)
            # Indian symbols end in .NS (NSE) or .BO (BSE)
            if asset.asset_name.endswith('.NS') or asset.asset_name.endswith('.BO'):
                final_price = raw_price
            elif asset.asset_name == 'Gold':
                 final_price = raw_price 
            else:
                # Assume USD for others (AAPL, GOOGL, BTC-USD)
                final_price = raw_price * usd_rate
                print(f"   -> Converted USD {raw_price} to INR {final_price}")

            # 4. Update Database
            asset.current_value = final_price * float(asset.units)
            updated_count += 1
            print(f"   ✅ Updated {asset.asset_name} to ₹{asset.current_value}")

        except Exception as e:
            print(f"   ❌ Critical error on {asset.asset_name}: {e}")
            continue

    db.commit()
    print(f"🏁 SYNC COMPLETE. Updated {updated_count} assets.")
    
    return {
        "msg": f"Synced {updated_count} assets.", 
        "usd_rate": round(usd_rate, 2)
    }


# ---------------------------------------------------------
# 5. SEARCH ASSETS (AUTOCOMPLETE)
# ---------------------------------------------------------
@router.get("/search-assets")
def search_assets(q: str):
    """
    Searches Yahoo Finance for stock tickers.
    """
    if not q:
        return []
    
    try:
        url = f"https://query2.finance.yahoo.com/v1/finance/search?q={q}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers)
        data = response.json()
        
        results = []
        if 'quotes' in data:
            for item in data['quotes']:
                if item.get('quoteType') in ['EQUITY', 'ETF', 'MUTUALFUND']:
                    results.append({
                        "symbol": item.get('symbol'),
                        "name": item.get('shortname') or item.get('longname'),
                        "type": item.get('quoteType'),
                        "exchange": item.get('exchange')
                    })
        return results

    except Exception as e:
        print(f"Search Error: {e}")
        return []