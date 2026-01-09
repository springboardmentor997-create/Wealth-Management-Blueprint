from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.investment import Investment
from app.models.user import User

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("/")
def get_recommendations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Fetch user's investments
    investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
    
    total_value = sum(i.current_value for i in investments)
    recommendations = []

    # --- RULE 1: Diversification (Gold Check) ---
    # Checks if any asset name contains "GOLD" or "SGB"
    has_gold = any("GOLD" in i.asset_name.upper() or "SGB" in i.asset_name.upper() for i in investments)
    
    if not has_gold and total_value > 0:
        recommendations.append({
            "id": 1,
            "title": "Missing Hedge Asset",
            "desc": "Your portfolio has no Gold. Adding 5-10% in Gold BeES or SGB can reduce volatility.",
            "type": "warning"
        })

    # --- RULE 2: Portfolio Size (SIP Advice) ---
    if total_value < 10000:
        recommendations.append({
            "id": 2,
            "title": "Start Systematic Investment",
            "desc": "Your corpus is small. Consider starting a monthly SIP in Index Funds to build discipline.",
            "type": "info"
        })

    # --- RULE 3: Positive Reinforcement ---
    if not recommendations and total_value > 0:
        recommendations.append({
            "id": 3,
            "title": "Great Balance!",
            "desc": "Your portfolio looks well-diversified. Keep monitoring your goals.",
            "type": "success"
        })
        
    if total_value == 0:
         recommendations.append({
            "id": 4,
            "title": "Start Investing",
            "desc": "Your portfolio is empty. Try adding your first asset using the Search bar.",
            "type": "urgent"
        })

    return recommendations