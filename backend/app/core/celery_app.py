import os
from celery import Celery
from celery.schedules import crontab # 👈 Import this

# 1. Get Redis URL (Use Render's env var if available, else localhost)
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "wealth_manager",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=['app.tasks']
)

# 2. Configure Settings
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    worker_pool_restarts=True,
)

# 3. ⏰ THE NIGHTLY SCHEDULE (Celery Beat)
celery_app.conf.beat_schedule = {
    "refresh-every-night-at-midnight": {
        "task": "refresh_all_prices_nightly",  # Name of the function in tasks.py
        "schedule": crontab(hour=0, minute=0), # Run at 12:00 AM
        # If you want to test it every minute, use: crontab(minute="*")
    }
}