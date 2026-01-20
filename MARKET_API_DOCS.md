# Stock Market APIs Integration

## Overview
Integrated Alpha Vantage (global stocks) and Indian Stock API (NSE/BSE) into the Wealth Manager backend for real-time market data.

## New Endpoints

### 1. **Search Stocks (Both Markets)**
```
GET /market/search?q=<query>
```
- Searches both global and Indian markets
- Returns results from both if available
- **Auth Required:** Yes (JWT)
- **Example:**
  ```bash
  curl -H "Authorization: Bearer <token>" \
    "http://localhost:8000/market/search?q=AAPL"
  ```
- **Response:**
  ```json
  {
    "query": "AAPL",
    "global": {
      "market": "GLOBAL",
      "symbol": "AAPL",
      "price": 245.50,
      "change": "+2.50",
      "change_percent": "+1.03%",
      "last_updated": "2026-01-08",
      "volume": "52500000",
      "high": "246.50",
      "low": "243.00"
    },
    "india": [],
    "timestamp": "2026-01-08T20:30:00"
  }
  ```

### 2. **Get Stock Data (Auto-Detect Market)**
```
GET /market/stock/<symbol>
```
- Automatically detects which market the symbol belongs to
- Tries global first, then Indian market
- **Auth Required:** Yes (JWT)
- **Example:**
  ```bash
  curl -H "Authorization: Bearer <token>" \
    "http://localhost:8000/market/stock/TCS"
  ```

### 3. **Get Global Stock Quote**
```
GET /market/global/quote/<symbol>
```
- Fetches data from Alpha Vantage API
- Real-time global stock prices
- **Auth Required:** Yes (JWT)
- **Params:** None
- **Example:**
  ```bash
  curl -H "Authorization: Bearer <token>" \
    "http://localhost:8000/market/global/quote/MSFT"
  ```

### 4. **Search Indian Stocks**
```
GET /market/india/search?q=<query>
```
- Search for Indian stocks by name or symbol
- Uses free Indian stock API
- **Auth Required:** Yes (JWT)
- **Params:**
  - `q` (required): Search query
- **Example:**
  ```bash
  curl -H "Authorization: Bearer <token>" \
    "http://localhost:8000/market/india/search?q=TCS"
  ```
- **Response:**
  ```json
  {
    "market": "INDIA",
    "results": [
      {
        "symbol": "TCS",
        "name": "Tata Consultancy Services"
      }
    ],
    "query": "TCS"
  }
  ```

### 5. **Get Single Indian Stock**
```
GET /market/india/stock/<symbol>?res_type=<format>
```
- Get detailed data for an Indian stock
- **Auth Required:** Yes (JWT)
- **Params:**
  - `res_type` (optional): "num" (default) or "csv"
- **Example:**
  ```bash
  curl -H "Authorization: Bearer <token>" \
    "http://localhost:8000/market/india/stock/INFY?res_type=num"
  ```

### 6. **Get Multiple Indian Stocks**
```
GET /market/india/stocks?symbols=<sym1>,<sym2>,<sym3>&res_type=<format>
```
- Fetch multiple Indian stocks in one request
- **Auth Required:** Yes (JWT)
- **Params:**
  - `symbols` (required): Comma-separated stock symbols
  - `res_type` (optional): "num" (default) or "csv"
- **Example:**
  ```bash
  curl -H "Authorization: Bearer <token>" \
    "http://localhost:8000/market/india/stocks?symbols=TCS,INFY,RELIANCE"
  ```
- **Response:**
  ```json
  {
    "market": "INDIA",
    "symbols": "TCS,INFY,RELIANCE",
    "stocks": [
      {
        "symbol": "TCS",
        "data": { ...stock_data... }
      },
      {
        "symbol": "INFY",
        "data": { ...stock_data... }
      }
    ],
    "res_type": "num"
  }
  ```

### 7. **Get Investment Recommendation**
```
GET /market/recommend/<symbol>
```
- Generates investment recommendation for a stock
- Returns suggested allocation across asset classes
- **Auth Required:** Yes (JWT)
- **Example:**
  ```bash
  curl -H "Authorization: Bearer <token>" \
    "http://localhost:8000/market/recommend/AAPL"
  ```
- **Response:**
  ```json
  {
    "symbol": "AAPL",
    "recommendation": "Strong buy signal based on technical analysis...",
    "suggested_allocation": {
      "stocks": 40,
      "mutual_funds": 35,
      "bonds": 20,
      "cash": 5
    },
    "stock_data": { ...stock_data... }
  }
  ```

## Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
# Alpha Vantage API Key (get free key from https://www.alphavantage.co/api/)
ALPHA_VANTAGE_API_KEY=your-api-key-here

# Database Configuration
DATABASE_URL=postgresql://postgres:Srusanth25@localhost:4000/wealth_db

# Security
SECRET_KEY=your-secret-key

# Optional: Celery/Redis
CELERY_BROKER_URL=redis://localhost:6379/0
REDIS_URL=redis://localhost:6379/0
```

### Getting Alpha Vantage API Key
1. Visit https://www.alphavantage.co/api/
2. Sign up for a free account
3. Get your API key (free tier: 5 calls/min, 500 calls/day)
4. Set it in your `.env` file

## Technical Details

### Market Service (`services/market_service.py`)
- **`get_global_stock(symbol)`**: Fetches global stock from Alpha Vantage
- **`search_indian_stock(query)`**: Searches Indian stocks
- **`get_indian_stock(symbol, res_type)`**: Gets Indian stock data
- **`get_multiple_indian_stocks(symbols, res_type)`**: Gets multiple Indian stocks
- **`search_stock(query)`**: Combined search across both markets
- **`get_stock(symbol)`**: Auto-detects market and fetches data

### Error Handling
- All functions have try-catch blocks
- Returns error messages if API fails
- Handles timeouts (10s default)
- Logs all errors for debugging

### Rate Limiting
- Alpha Vantage free tier: 5 requests/minute
- Consider implementing caching for production
- Use `requests.adapters.HTTPAdapter` with retry strategy

## Testing

Run market API tests:
```bash
cd backend
pytest -q tests/test_market_api.py
```

Tests cover:
- ✅ Search functionality (both markets)
- ✅ Single stock queries
- ✅ Multiple stock queries
- ✅ Global quotes
- ✅ Indian stock searches
- ✅ Investment recommendations
- ✅ Authentication/Authorization
- ✅ Input validation
- ✅ Format parameter validation

**Current Status:** 9/9 tests passing ✅

## Future Improvements

1. **Caching**: Implement Redis caching for API responses
2. **Real-time Updates**: WebSocket integration for live price updates
3. **Historical Data**: Add intraday/daily/weekly historical charts
4. **Advanced Analytics**: Technical indicators, moving averages, RSI, MACD
5. **Alerts**: Price alerts when stocks hit target values
6. **Watchlists**: Save favorite stocks for quick access
7. **Comparison**: Compare multiple stocks side-by-side
8. **Rate Limiting**: Implement client-side rate limiting

## Dependencies

```
requests          # HTTP library for external APIs
pydantic-settings # Configuration management
reportlab         # PDF generation (for reports)
```

All dependencies added to `requirements.txt`

## Notes

- Demo API key "demo" has rate limits
- For production, get your own Alpha Vantage API key
- Indian Stock API is free and has no known rate limits
- All endpoints require JWT authentication
- Error responses include detailed error messages for debugging
