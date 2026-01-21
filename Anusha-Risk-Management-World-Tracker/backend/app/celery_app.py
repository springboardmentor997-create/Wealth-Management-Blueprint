from celery import Celery # pyright: ignore[reportMissingImports]
import os
from dotenv import load_dotenv # pyright: ignore[reportMissingImports]

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "wealth_management",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

@celery_app.task
def update_investment_prices():
    """
    Celery task to update investment prices nightly
    """
    from app.database import SessionLocal
    from app.models import Investment
    from app.services.market_data import update_investment_prices as update_prices
    
    db = SessionLocal()
    try:
        count = update_prices(db, Investment)
        return f"Updated {count} investments"
    finally:
        db.close()

# Import crontab for scheduling
from celery.schedules import crontab # pyright: ignore[reportMissingImports]

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    """
    Schedule periodic tasks
    """
    # Update prices daily at 2 AM UTC
    sender.add_periodic_task(
        crontab(hour=2, minute=0),
        update_investment_prices.s(),
        name='update-investment-prices-daily'
    )

