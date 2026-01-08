from celery import Celery
from celery.schedules import crontab
import os

# Celery configuration
celery_app = Celery(
    "wealth_management",
    broker=os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0"),
    backend=os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0"),
    include=["celery_tasks"]
)

# Celery beat schedule for periodic tasks
celery_app.conf.beat_schedule = {
    'update-market-prices': {
        'task': 'celery_tasks.update_market_prices',
        'schedule': crontab(minute=0, hour='9,12,15,18'),  # 4 times a day during market hours
    },
    'generate-daily-reports': {
        'task': 'celery_tasks.generate_daily_reports',
        'schedule': crontab(minute=0, hour=20),  # Daily at 8 PM
    },
}

celery_app.conf.timezone = 'UTC'