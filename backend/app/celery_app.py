from celery import Celery

# 1. Initialize Celery
# 'include' tells the worker exactly which files contain @task functions
celery_app = Celery(
    "wealth_manager",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
    include=['app.tasks']  # 👈 THIS IS THE FIX
)

# 2. Configure Settings (Optimized for Windows)
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    # Helps prevent freezing on Windows
    worker_pool_restarts=True,
)