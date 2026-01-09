from .celery_app import celery_app
from .core.database import SessionLocal

# 👇 IMPORT ALL MODELS HERE (To fix the "Mapper" error)
from .models.user import User
from .models.investment import Investment
from .models.goal import Goal 
# -----------------------------------------------------

import yfinance as yf

@celery_app.task(name="sync_market_prices_task")
def sync_market_prices_task(user_id: int):
    """
    Background task to sync prices.
    """
    print(f"--- 🚀 BACKGROUND TASK STARTED for User {user_id} ---")
    
    db = SessionLocal()
    
    try:
        assets = db.query(Investment).filter(Investment.user_id == user_id).all()
        updated_count = 0
        
        for asset in assets:
            ticker = asset.asset_name
            try:
                stock = yf.Ticker(ticker)
                history = stock.history(period="1d")
                
                if not history.empty:
                    raw_price = history['Close'].iloc[-1]
                    current_price = float(raw_price)
                    
                    # Update DB
                    asset.current_value = current_price * float(asset.units)
                    updated_count += 1
                    print(f" ✅ Updated {ticker}: {current_price}")
            except Exception as e:
                print(f" ❌ Error fetching {ticker}: {e}")

        db.commit()
        return f"Synced {updated_count} assets."
    
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        return f"Failed: {e}"
    
    finally:
        db.close()