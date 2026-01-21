# Celery Setup Guide

Celery is used for scheduled tasks like updating investment prices nightly.

## Setup

1. Make sure Redis is running:
```bash
# On Windows (using Docker or WSL)
docker run -d -p 6379:6379 redis

# On Linux/Mac
redis-server
```

2. Start Celery worker:
```bash
cd backend
celery -A app.celery_app worker --loglevel=info
```

3. Start Celery beat (scheduler) in a separate terminal:
```bash
cd backend
celery -A app.celery_app beat --loglevel=info
```

## Scheduled Tasks

- **Update Investment Prices**: Runs daily at 2 AM UTC
  - Updates all investment prices using market data APIs
  - Can also be triggered manually via API endpoint: `POST /api/investments/refresh-prices`

## Testing

You can test the task manually:
```python
from app.celery_app import update_investment_prices
update_investment_prices.delay()
```

