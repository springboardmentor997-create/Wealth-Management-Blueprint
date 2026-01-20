from workers.celery_app import celery_app
from sqlmodel import Session, select
from core.database import engine
from models.investment import Investment
from datetime import datetime
import random

@celery_app.task
def update_market_prices():
    """
    Simulates market price updates.
    Now uses real/mocked service data instead of random numbers.
    """
    from services.market_service import get_stock
    import logging

    logger = logging.getLogger(__name__)

    with Session(engine) as session:
        investments = session.exec(select(Investment)).all()
        updated_count = 0

        for inv in investments:
            try:
                # Fetch data from service (handles global/indian/mock automatically)
                stock_data = get_stock(inv.symbol)
                
                if stock_data and "price" in stock_data and stock_data["price"]:
                    new_price = float(stock_data["price"])
                    
                    inv.last_price = new_price
                    inv.current_value = new_price * float(inv.units or 0)
                    inv.last_price_at = datetime.utcnow()
                    updated_count += 1
                else:
                    logger.warning(f"Could not fetch price for {inv.symbol}")
            except Exception as e:
                logger.error(f"Error updating {inv.symbol}: {e}")
                continue

        session.commit()

    return f"Market prices updated for {updated_count} investments"
