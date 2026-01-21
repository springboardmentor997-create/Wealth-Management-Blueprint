# API Reference Guide

## Base URL
```
Development: http://localhost:8000
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require JWT authentication:
```http
Authorization: Bearer <access_token>
```

## Response Format

### Success Response
```json
{
  "data": {},
  "message": "Success",
  "status": 200
}
```

### Error Response
```json
{
  "detail": "Error description",
  "status": 400
}
```

---

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "risk_profile": "moderate"
}
```

**Response (201):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "risk_profile": "moderate",
  "kyc_status": "unverified",
  "created_at": "2024-01-15T10:30:00"
}
```

**Validation Errors:**
- `name`: Required, max 255 characters
- `email`: Valid email format, unique
- `password`: Minimum 8 characters
- `risk_profile`: Must be "conservative", "moderate", or "aggressive"

### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "risk_profile": "moderate"
  }
}
```

### Refresh Token
```http
POST /api/auth/refresh
```

**Request Body:**
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response (200):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "risk_profile": "moderate",
  "kyc_status": "unverified",
  "created_at": "2024-01-15T10:30:00"
}
```

---

## User Management

### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "risk_profile": "moderate",
  "kyc_status": "unverified",
  "total_invested": 15000.00,
  "current_value": 16500.50,
  "total_return": 1500.50,
  "return_percentage": 10.00,
  "goals_count": 3,
  "completed_goals": 1,
  "created_at": "2024-01-15T10:30:00"
}
```

### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "risk_profile": "aggressive"
}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "John Updated",
  "email": "john@example.com",
  "risk_profile": "aggressive",
  "kyc_status": "unverified",
  "updated_at": "2024-01-16T09:15:00"
}
```

---

## Goals Management

### Get All Goals
```http
GET /api/goals
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status`: Filter by status (`active`, `completed`, `paused`)
- `type`: Filter by goal type (`retirement`, `home`, `education`, `custom`)
- `limit`: Number of results to return (default: 50)
- `offset`: Number of results to skip (default: 0)

**Response (200):**
```json
{
  "goals": [
    {
      "id": 1,
      "title": "Retirement Fund",
      "description": "Retirement savings goal",
      "target_amount": 1000000.00,
      "current_amount": 50000.00,
      "progress_percentage": 5.00,
      "target_date": "2045-01-01",
      "goal_type": "retirement",
      "status": "active",
      "monthly_contribution_needed": 2500.00,
      "years_remaining": 21,
      "created_at": "2024-01-15T10:30:00"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

### Create Goal
```http
POST /api/goals
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Home Purchase",
  "description": "Save for down payment on house",
  "target_amount": 100000.00,
  "target_date": "2028-01-01",
  "goal_type": "home"
}
```

**Response (201):**
```json
{
  "id": 2,
  "title": "Home Purchase",
  "description": "Save for down payment on house",
  "target_amount": 100000.00,
  "current_amount": 0.00,
  "progress_percentage": 0.00,
  "target_date": "2028-01-01",
  "goal_type": "home",
  "status": "active",
  "monthly_contribution_needed": 2083.33,
  "years_remaining": 4,
  "created_at": "2024-01-16T09:20:00"
}
```

### Get Goal by ID
```http
GET /api/goals/{goal_id}
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": 1,
  "title": "Retirement Fund",
  "description": "Retirement savings goal",
  "target_amount": 1000000.00,
  "current_amount": 50000.00,
  "progress_percentage": 5.00,
  "target_date": "2045-01-01",
  "goal_type": "retirement",
  "status": "active",
  "monthly_contribution_needed": 2500.00,
  "years_remaining": 21,
  "transactions": [
    {
      "id": 1,
      "amount": 5000.00,
      "transaction_date": "2024-01-15",
      "notes": "Initial contribution"
    }
  ],
  "simulations": [
    {
      "id": 1,
      "scenario_name": "Aggressive Investment",
      "projected_value": 1500000.00,
      "probability_of_success": 85
    }
  ],
  "created_at": "2024-01-15T10:30:00"
}
```

### Update Goal
```http
PUT /api/goals/{goal_id}
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "current_amount": 75000.00,
  "status": "active"
}
```

**Response (200):**
```json
{
  "id": 1,
  "title": "Retirement Fund",
  "target_amount": 1000000.00,
  "current_amount": 75000.00,
  "progress_percentage": 7.50,
  "updated_at": "2024-01-16T09:25:00"
}
```

### Delete Goal
```http
DELETE /api/goals/{goal_id}
Authorization: Bearer <access_token>
```

**Response (204):**
No content returned on successful deletion.

### Get Goal Progress
```http
GET /api/goals/{goal_id}/progress
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "goal_id": 1,
  "progress_percentage": 7.50,
  "current_amount": 75000.00,
  "target_amount": 1000000.00,
  "amount_remaining": 925000.00,
  "monthly_contribution_needed": 2312.50,
  "years_remaining": 20.8,
  "on_track": true,
  "projected_completion_date": "2044-09-01",
  "monthly_contributions": [
    {
      "month": "2024-01",
      "amount": 5000.00
    },
    {
      "month": "2024-02",
      "amount": 2500.00
    }
  ]
}
```

---

## Investments Management

### Get All Investments
```http
GET /api/investments
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `type`: Filter by investment type (`stock`, `etf`, `mutual_fund`, `bond`, `cash`)
- `limit`: Number of results to return (default: 50)
- `offset`: Number of results to skip (default: 0)

**Response (200):**
```json
{
  "investments": [
    {
      "id": 1,
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "quantity": 100,
      "avg_cost": 150.00,
      "current_price": 175.50,
      "market_value": 17550.00,
      "cost_basis": 15000.00,
      "unrealized_gain_loss": 2550.00,
      "gain_loss_percentage": 17.00,
      "investment_type": "stock",
      "last_updated": "2024-01-16T15:30:00",
      "created_at": "2024-01-15T10:30:00"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0,
  "summary": {
    "total_market_value": 17550.00,
    "total_cost_basis": 15000.00,
    "total_gain_loss": 2550.00,
    "total_gain_loss_percentage": 17.00
  }
}
```

### Create Investment
```http
POST /api/investments
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "symbol": "GOOGL",
  "name": "Alphabet Inc.",
  "quantity": 50,
  "avg_cost": 2800.00,
  "investment_type": "stock"
}
```

**Response (201):**
```json
{
  "id": 2,
  "symbol": "GOOGL",
  "name": "Alphabet Inc.",
  "quantity": 50,
  "avg_cost": 2800.00,
  "current_price": 2850.00,
  "market_value": 142500.00,
  "cost_basis": 140000.00,
  "unrealized_gain_loss": 2500.00,
  "gain_loss_percentage": 1.79,
  "investment_type": "stock",
  "last_updated": "2024-01-16T15:30:00",
  "created_at": "2024-01-16T09:30:00"
}
```

### Get Investment by ID
```http
GET /api/investments/{investment_id}
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": 1,
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "quantity": 100,
  "avg_cost": 150.00,
  "current_price": 175.50,
  "market_value": 17550.00,
  "cost_basis": 15000.00,
  "unrealized_gain_loss": 2550.00,
  "gain_loss_percentage": 17.00,
  "investment_type": "stock",
  "last_updated": "2024-01-16T15:30:00",
  "created_at": "2024-01-15T10:30:00",
  "transactions": [
    {
      "id": 1,
      "transaction_type": "buy",
      "quantity": 100,
      "price": 150.00,
      "amount": 15000.00,
      "transaction_date": "2024-01-15",
      "notes": "Initial purchase"
    }
  ],
  "price_history": [
    {
      "date": "2024-01-16",
      "price": 175.50
    },
    {
      "date": "2024-01-15",
      "price": 174.20
    }
  ]
}
```

### Update Investment
```http
PUT /api/investments/{investment_id}
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "quantity": 120,
  "avg_cost": 145.00
}
```

**Response (200):**
```json
{
  "id": 1,
  "symbol": "AAPL",
  "quantity": 120,
  "avg_cost": 145.00,
  "updated_at": "2024-01-16T09:35:00"
}
```

### Delete Investment
```http
DELETE /api/investments/{investment_id}
Authorization: Bearer <access_token>
```

**Response (204):**
No content returned on successful deletion.

### Refresh Investment Prices
```http
POST /api/investments/refresh-prices
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "Prices refreshed successfully",
  "updated_count": 5,
  "failed_count": 0,
  "last_updated": "2024-01-16T15:30:00"
}
```

### Refresh Single Investment Price
```http
POST /api/investments/{investment_id}/refresh-price
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": 1,
  "symbol": "AAPL",
  "previous_price": 175.50,
  "new_price": 176.20,
  "price_change": 0.70,
  "price_change_percentage": 0.40,
  "last_updated": "2024-01-16T15:35:00"
}
```

---

## Transactions Management

### Get All Transactions
```http
GET /api/transactions
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `investment_id`: Filter by investment ID
- `type`: Filter by transaction type (`buy`, `sell`, `dividend`, `deposit`, `withdrawal`)
- `start_date`: Filter by start date (YYYY-MM-DD)
- `end_date`: Filter by end date (YYYY-MM-DD)
- `limit`: Number of results to return (default: 50)
- `offset`: Number of results to skip (default: 0)

**Response (200):**
```json
{
  "transactions": [
    {
      "id": 1,
      "investment_id": 1,
      "investment_symbol": "AAPL",
      "investment_name": "Apple Inc.",
      "transaction_type": "buy",
      "quantity": 100,
      "price": 150.00,
      "amount": 15000.00,
      "transaction_date": "2024-01-15",
      "notes": "Initial purchase",
      "created_at": "2024-01-15T10:30:00"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0,
  "summary": {
    "total_amount": 15000.00,
    "buy_count": 1,
    "sell_count": 0,
    "dividend_count": 0
  }
}
```

### Create Transaction
```http
POST /api/transactions
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "investment_id": 1,
  "transaction_type": "buy",
  "quantity": 25,
  "price": 176.00,
  "transaction_date": "2024-01-16",
  "notes": "Additional purchase"
}
```

**Response (201):**
```json
{
  "id": 2,
  "investment_id": 1,
  "investment_symbol": "AAPL",
  "investment_name": "Apple Inc.",
  "transaction_type": "buy",
  "quantity": 25,
  "price": 176.00,
  "amount": 4400.00,
  "transaction_date": "2024-01-16",
  "notes": "Additional purchase",
  "created_at": "2024-01-16T09:40:00"
}
```

### Get Transaction by ID
```http
GET /api/transactions/{transaction_id}
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": 1,
  "investment_id": 1,
  "investment_symbol": "AAPL",
  "investment_name": "Apple Inc.",
  "transaction_type": "buy",
  "quantity": 100,
  "price": 150.00,
  "amount": 15000.00,
  "transaction_date": "2024-01-15",
  "notes": "Initial purchase",
  "created_at": "2024-01-15T10:30:00"
}
```

---

## Simulations

### Get All Simulations
```http
GET /api/simulations
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "simulations": [
    {
      "id": 1,
      "goal_id": 1,
      "scenario_name": "Aggressive Investment",
      "description": "High-risk, high-return scenario",
      "assumptions": {
        "annual_return": 12.0,
        "volatility": 18.0,
        "inflation_rate": 3.0,
        "monthly_contribution": 2500.00
      },
      "results": {
        "projected_value": 1500000.00,
        "probability_of_success": 85,
        "years_to_goal": 20,
        "total_contributions": 600000.00,
        "investment_returns": 900000.00
      },
      "created_at": "2024-01-15T11:00:00"
    }
  ]
}
```

### Create Simulation
```http
POST /api/simulations
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "goal_id": 1,
  "scenario_name": "Conservative Approach",
  "description": "Low-risk, steady growth scenario",
  "assumptions": {
    "annual_return": 6.0,
    "volatility": 8.0,
    "inflation_rate": 3.0,
    "monthly_contribution": 3000.00
  }
}
```

**Response (201):**
```json
{
  "id": 2,
  "goal_id": 1,
  "scenario_name": "Conservative Approach",
  "description": "Low-risk, steady growth scenario",
  "assumptions": {
    "annual_return": 6.0,
    "volatility": 8.0,
    "inflation_rate": 3.0,
    "monthly_contribution": 3000.00
  },
  "results": {
    "projected_value": 1200000.00,
    "probability_of_success": 95,
    "years_to_goal": 21,
    "total_contributions": 756000.00,
    "investment_returns": 444000.00
  },
  "created_at": "2024-01-16T09:45:00"
}
```

### Quick Goal Simulation
```http
POST /api/simulations/goal/{goal_id}/simulate
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "monthly_contribution": 3500.00,
  "annual_return": 8.0,
  "years_to_goal": 20
}
```

**Response (200):**
```json
{
  "goal_id": 1,
  "simulation_result": {
    "projected_value": 1350000.00,
    "probability_of_success": 90,
    "total_contributions": 840000.00,
    "investment_returns": 510000.00,
    "monthly_contribution_needed": 3500.00,
    "on_track": true
  }
}
```

---

## Recommendations

### Get All Recommendations
```http
GET /api/recommendations
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "recommendations": [
    {
      "id": 1,
      "recommendation_type": "portfolio_rebalance",
      "title": "Rebalance Portfolio to Target Allocation",
      "description": "Your portfolio is overweight in tech stocks. Consider diversifying.",
      "priority": "high",
      "action_items": [
        "Reduce AAPL position by 20%",
        "Increase bond allocation to 15%",
        "Add international ETF exposure"
      ],
      "expected_impact": "Reduced volatility, improved risk-adjusted returns",
      "created_at": "2024-01-16T08:00:00"
    }
  ]
}
```

### Generate Recommendations
```http
POST /api/recommendations/generate
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "Recommendations generated successfully",
  "recommendations_count": 3,
  "recommendations": [
    {
      "id": 2,
      "recommendation_type": "goal_optimization",
      "title": "Increase Retirement Contributions",
      "description": "Based on your risk profile, consider increasing monthly contributions.",
      "priority": "medium",
      "action_items": [
        "Increase monthly contribution by $500",
        "Consider catch-up contributions if over 50",
        "Review tax-advantaged accounts"
      ]
    }
  ]
}
```

### Get Current Portfolio Allocation
```http
GET /api/recommendations/allocation/current
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "current_allocation": {
    "stocks": 70.0,
    "bonds": 15.0,
    "etfs": 10.0,
    "cash": 5.0
  },
  "recommended_allocation": {
    "stocks": 60.0,
    "bonds": 25.0,
    "etfs": 10.0,
    "cash": 5.0
  },
  "rebalance_needed": true,
  "rebalance_suggestions": [
    {
      "asset_class": "stocks",
      "current_percentage": 70.0,
      "target_percentage": 60.0,
      "action": "sell",
      "amount": 10500.00
    },
    {
      "asset_class": "bonds",
      "current_percentage": 15.0,
      "target_percentage": 25.0,
      "action": "buy",
      "amount": 10500.00
    }
  ]
}
```

---

## Reports

### Download Portfolio Report (PDF)
```http
GET /api/reports/portfolio/pdf
Authorization: Bearer <access_token>
```

**Response (200):**
Content-Type: application/pdf
Content-Disposition: attachment; filename="portfolio_report_2024-01-16.pdf"

PDF contains:
- Portfolio summary
- Holdings breakdown
- Performance metrics
- Transaction history
- Recommendations

### Download Portfolio Report (CSV)
```http
GET /api/reports/portfolio/csv
Authorization: Bearer <access_token>
```

**Response (200):**
Content-Type: text/csv
Content-Disposition: attachment; filename="portfolio_report_2024-01-16.csv"

CSV columns:
- Date, Symbol, Name, Type, Quantity, Price, Amount, Transaction Type

### Download Goals Report (PDF)
```http
GET /api/reports/goals/pdf
Authorization: Bearer <access_token>
```

**Response (200):**
Content-Type: application/pdf
Content-Disposition: attachment; filename="goals_report_2024-01-16.pdf"

PDF contains:
- Goals overview
- Progress tracking
- Completion projections
- Simulation results

---

## Admin Endpoints

### Admin Login
```http
POST /api/admin/login
```

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "admin": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com"
  }
}
```

### Get All Users
```http
GET /api/admin/users
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**
- `status`: Filter by KYC status (`unverified`, `pending`, `verified`)
- `risk_profile`: Filter by risk profile
- `limit`: Number of results to return (default: 50)
- `offset`: Number of results to skip (default: 0)

**Response (200):**
```json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "risk_profile": "moderate",
      "kyc_status": "unverified",
      "total_invested": 15000.00,
      "current_value": 16500.50,
      "registration_date": "2024-01-15",
      "last_login": "2024-01-16T09:00:00"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

### Get User Analytics
```http
GET /api/admin/analytics
Authorization: Bearer <admin_access_token>
```

**Response (200):**
```json
{
  "user_statistics": {
    "total_users": 150,
    "active_users": 120,
    "new_users_this_month": 25,
    "verified_users": 80,
    "unverified_users": 70
  },
  "portfolio_statistics": {
    "total_assets_under_management": 2500000.00,
    "average_portfolio_size": 16666.67,
    "total_investments": 1500,
    "best_performing_asset": "AAPL",
    "worst_performing_asset": "XYZ"
  },
  "goal_statistics": {
    "total_goals": 450,
    "completed_goals": 75,
    "active_goals": 375,
    "average_goal_amount": 100000.00,
    "most_common_goal_type": "retirement"
  },
  "transaction_statistics": {
    "total_transactions": 5000,
    "transactions_this_month": 500,
    "total_transaction_volume": 1000000.00,
    "average_transaction_size": 200.00
  }
}
```

### Export User Data
```http
GET /api/admin/export/users
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**
- `format`: Export format (`csv`, `json`) - default: `csv`
- `status`: Filter by KYC status
- `date_from`: Filter by registration date (YYYY-MM-DD)
- `date_to`: Filter by registration date (YYYY-MM-DD)

**Response (200):**
Content-Type: text/csv (or application/json)
Content-Disposition: attachment; filename="users_export_2024-01-16.csv"

CSV columns:
- ID, Name, Email, Risk Profile, KYC Status, Total Invested, Current Value, Registration Date, Last Login

---

## Error Codes

### Authentication Errors
- `401`: Unauthorized - Invalid or missing token
- `403`: Forbidden - Insufficient permissions
- `422`: Validation Error - Invalid input data

### User Errors
- `400`: Bad Request - Invalid request parameters
- `404`: Not Found - Resource not found
- `409`: Conflict - Resource already exists (e.g., duplicate email)

### Server Errors
- `500`: Internal Server Error - Unexpected server error
- `503`: Service Unavailable - Server temporarily unavailable

### Rate Limiting
- `429`: Too Many Requests - Rate limit exceeded

---

## Rate Limiting

### Endpoints with Rate Limits
- Authentication endpoints: 5 requests per minute
- Market data endpoints: 100 requests per hour
- Report generation: 10 requests per hour
- All other endpoints: 1000 requests per hour

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642694400
```

---

## Webhooks (Future Feature)

### Portfolio Update Webhook
```http
POST /webhooks/portfolio-update
Content-Type: application/json
X-Signature: sha256=<signature>

{
  "user_id": 1,
  "portfolio_value": 17500.00,
  "change_amount": 500.00,
  "change_percentage": 2.94,
  "timestamp": "2024-01-16T15:30:00Z"
}
```

### Goal Achievement Webhook
```http
POST /webhooks/goal-achieved
Content-Type: application/json
X-Signature: sha256=<signature>

{
  "user_id": 1,
  "goal_id": 1,
  "goal_title": "Emergency Fund",
  "achieved_date": "2024-01-16",
  "final_amount": 10000.00
}
```

---

## SDK Examples

### Python SDK Example
```python
import requests

# Base URL
BASE_URL = "http://localhost:8000"

# Login
response = requests.post(f"{BASE_URL}/api/auth/login", json={
    "email": "user@example.com",
    "password": "password123"
})
token = response.json()["access_token"]

# Headers for authenticated requests
headers = {"Authorization": f"Bearer {token}"}

# Get goals
goals = requests.get(f"{BASE_URL}/api/goals", headers=headers)
print(goals.json())

# Create investment
investment = requests.post(f"{BASE_URL}/api/investments", 
    headers=headers,
    json={
        "symbol": "AAPL",
        "name": "Apple Inc.",
        "quantity": 100,
        "avg_cost": 150.00,
        "investment_type": "stock"
    }
)
print(investment.json())
```

### JavaScript SDK Example
```javascript
// Base URL
const BASE_URL = "http://localhost:8000";

// Login
const login = async (email, password) => {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

// Get goals with token
const getGoals = async (token) => {
  const response = await fetch(`${BASE_URL}/api/goals`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Create investment
const createInvestment = async (token, investment) => {
  const response = await fetch(`${BASE_URL}/api/investments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(investment)
  });
  return response.json();
};
```

---

## Testing

### Postman Collection
Import the provided Postman collection to test all endpoints:
- Authentication flows
- CRUD operations
- Error scenarios
- Admin functions

### Test Data
Use the following test credentials:
- **User**: `test@example.com` / `Test@1234`
- **Admin**: `admin` / `admin123`

### Health Check
```http
GET /api/health
```

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-16T15:30:00Z",
  "version": "1.0.0"
}
```

---

## Changelog

### Version 1.0.0 (2024-01-16)
- Initial release
- Complete authentication system
- Full CRUD operations for goals, investments, transactions
- Admin panel with analytics
- Real-time market data integration
- Report generation (PDF/CSV)
- Comprehensive API documentation

---

## Support

For API support:
1. Check this documentation
2. Review error messages
3. Test with provided examples
4. Contact development team

API Status: [https://status.your-domain.com](https://status.your-domain.com)
