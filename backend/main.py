from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Wealth Tracker API")

# CORS (important for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Backend ready"}

# ✅ Dashboard Summary API
@app.get("/api/v1/dashboard/summary")
def dashboard_summary():
    return {
        "portfolio": {
            "total_value": 125000,
            "total_invested": 100000,
            "total_gain_loss": 25000,
            "gain_loss_percentage": 25,
            "asset_allocation": {
                "Stocks": 50,
                "Mutual Funds": 25,
                "Crypto": 15,
                "Bonds": 10
            },
            "performance": [
                {"month": "Jan", "value": 90000},
                {"month": "Feb", "value": 95000},
                {"month": "Mar", "value": 98000},
                {"month": "Apr", "value": 102000},
                {"month": "May", "value": 110000},
                {"month": "Jun", "value": 125000}
            ]
        },
        "goals": [
            {
                "id": "1",
                "name": "Buy a House",
                "current_amount": 400000,
                "target_amount": 1000000,
                "deadline": "2028-12-31",
                "status": "on_track",
                "category": "house"
            },
            {
                "id": "2",
                "name": "Emergency Fund",
                "current_amount": 150000,
                "target_amount": 300000,
                "deadline": "2026-06-30",
                "status": "at_risk",
                "category": "emergency"
            }
        ]
    }
