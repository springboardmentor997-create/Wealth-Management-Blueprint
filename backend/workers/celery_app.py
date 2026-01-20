from celery import Celery
from celery.schedules import crontab


celery_app = Celery(
    "wealth_tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/1"
)

celery_app.conf.beat_schedule = {
    "nightly-market-update": {
        "task": "workers.tasks.update_market_prices",
        "schedule": crontab(hour=1, minute=0),  
    }
}

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
)
