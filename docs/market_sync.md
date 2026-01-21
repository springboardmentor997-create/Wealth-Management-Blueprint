# Market Sync & Nightly Price Refresh

This document explains how market price fetching and nightly refresh are implemented and how to run them.

## Current status
- Market price fetching is implemented using `yfinance` in `fastapi_backend/market_service.py`.
  - `MarketDataService.get_stock_price(symbol)` returns the latest close price for a symbol.
  - Portfolio price updates are implemented by `MarketDataService.update_portfolio_prices(db)`.
- Celery periodic tasks are configured in `fastapi_backend/celery_app.py`.
  - Price updates run multiple times during market hours and a nightly full update at midnight (UTC).
  - Tasks are implemented in `fastapi_backend/celery_tasks.py` (`update_market_prices`).

## How to run Celery (development)
1. Ensure Redis is running and `CELERY_BROKER_URL` / `CELERY_RESULT_BACKEND` in `.env` point to it (default: `redis://localhost:6379/0`).
2. Start a Celery worker + beat with:

```bash
# From project root
celery -A fastapi_backend.celery_app.celery_app worker --beat --loglevel=info
```

This will run the scheduled tasks including the nightly update.

## One-off price update
If you want to trigger a manual update (e.g., while debugging or before a demo):

```bash
python -m fastapi_backend.scripts.update_market_prices
```

## Notes & Improvements
- Current implementation uses `yfinance`. For higher reliability consider another market data provider or caching layer.
- Add retries and exponential backoff to the `update_market_prices` task (Celery `retry`) for transient failures.
- Consider adding monitoring and alerts if the nightly job fails repeatedly.

