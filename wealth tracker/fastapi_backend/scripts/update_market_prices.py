"""Run a one-off portfolio price update using MarketDataService.
Usage:
  python -m fastapi_backend.scripts.update_market_prices
"""
from sqlalchemy.orm import Session
from fastapi_backend.database import SessionLocal, engine
from fastapi_backend.market_service import MarketDataService


def run_update():
    db: Session = SessionLocal()
    try:
        success = MarketDataService.update_portfolio_prices(db)
        if success:
            print("Prices updated successfully")
        else:
            print("Price update reported failure")
    except Exception as e:
        print(f"Error running price update: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    run_update()
