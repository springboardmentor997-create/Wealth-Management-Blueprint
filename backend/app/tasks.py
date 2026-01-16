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
@celery_app.task(name="refresh_all_prices_nightly")
def refresh_all_prices_nightly():
    """
    Runs every night. Fetches prices for ALL investments in the database.
    """
    print("--- 🌙 NIGHTLY PRICE REFRESH STARTED ---")
    
    db = SessionLocal()
    try:
        # 1. Get all investments (optimally, you'd get unique symbols first)
        all_assets = db.query(Investment).all()
        updated_count = 0
        
        print(f"Found {len(all_assets)} assets to check.")

        for asset in all_assets:
            if not asset.asset_name:
                continue

            ticker = asset.asset_name
            try:
                # Fetch Price
                stock = yf.Ticker(ticker)
                fast_info = stock.fast_info # Faster than .history()
                current_price = fast_info.last_price

                if current_price:
                    # Update Value
                    # asset.units is likely a float or decimal
                    asset.current_value = current_price * float(asset.units)
                    updated_count += 1
                    print(f" ✅ Updated {ticker} (User {asset.user_id}): ${current_price:.2f}")

            except Exception as e:
                print(f" ⚠️ Could not fetch {ticker}: {e}")

        db.commit()
        print(f"--- 🌙 COMPLETED. Updated {updated_count} assets. ---")
        return f"Nightly sync finished. Updated {updated_count}."

    except Exception as e:
        print(f"❌ CRITICAL NIGHTLY ERROR: {e}")
    finally:
        db.close()