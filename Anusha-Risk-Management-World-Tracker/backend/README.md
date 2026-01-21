# Wealth Management & Goal Tracker - Backend API

FastAPI backend for the Wealth Management & Goal Tracker system.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials and API keys
```

4. Set up PostgreSQL database:
- Create a database named `wealth_management_db`
- Update `DATABASE_URL` in `.env`

5. Run the application:
```bash
python run.py
```

The API will be available at `http://localhost:8000`

API documentation available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Goals
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create a goal
- `GET /api/goals/{id}` - Get a specific goal
- `PUT /api/goals/{id}` - Update a goal
- `DELETE /api/goals/{id}` - Delete a goal

### Investments
- `GET /api/investments` - Get all investments
- `POST /api/investments` - Create an investment
- `GET /api/investments/{id}` - Get a specific investment
- `PUT /api/investments/{id}` - Update an investment
- `DELETE /api/investments/{id}` - Delete an investment

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create a transaction
- `GET /api/transactions/{id}` - Get a specific transaction

