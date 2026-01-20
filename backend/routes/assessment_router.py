from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select
from core.database import get_session
from models.user import User, RiskProfile
from core.security import get_current_user

router = APIRouter(prefix="/assessment", tags=["Assessment"])


class RiskAssessmentPayload(BaseModel):
    """
    Risk tolerance assessment quiz submission.
    Each question is rated 1-5, with higher scores = higher risk tolerance.
    
    Questions:
    1. When markets drop 20%, your reaction?
    2. Investment time horizon?
    3. Comfort with volatility?
    4. Experience level?
    5. Financial stability?
    """
    question1: int  # Market drop reaction (1-5)
    question2: int  # Time horizon (1-5)
    question3: int  # Volatility comfort (1-5)
    question4: int  # Experience (1-5)
    question5: int  # Financial stability (1-5)


class RiskAssessmentResponse(BaseModel):
    risk_profile: str
    score: float
    recommendation: str


def calculate_risk_profile(score: float) -> tuple[RiskProfile, str]:
    """
    Convert risk assessment score (1-5 average) to risk profile.
    
    1.0-2.3: Conservative
    2.3-3.7: Moderate
    3.7-5.0: Aggressive
    """
    if score < 2.3:
        return RiskProfile.conservative, "Conservative: Prioritize capital preservation and steady growth"
    elif score < 3.7:
        return RiskProfile.moderate, "Moderate: Balance growth with stability"
    else:
        return RiskProfile.aggressive, "Aggressive: Pursue high growth, comfortable with volatility"


@router.post("/risk-tolerance")
async def submit_risk_assessment(
    payload: RiskAssessmentPayload,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user)
):
    """
    Submit risk tolerance assessment and update user profile.
    
    Score calculation:
    - All 5 questions are on 1-5 scale
    - Average of all responses = final score
    - Score determines risk profile: conservative, moderate, or aggressive
    """
    # Validate all answers are in 1-5 range
    answers = [
        payload.question1,
        payload.question2,
        payload.question3,
        payload.question4,
        payload.question5
    ]
    
    for i, answer in enumerate(answers, 1):
        if not (1 <= answer <= 5):
            raise HTTPException(
                status_code=400,
                detail=f"Question {i} must be between 1 and 5"
            )
    
    # Calculate average score
    score = sum(answers) / len(answers)
    
    # Determine risk profile
    risk_profile, recommendation = calculate_risk_profile(score)
    
    # Update user's risk profile
    user.risk_profile = risk_profile
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return RiskAssessmentResponse(
        risk_profile=risk_profile.value,
        score=round(score, 2),
        recommendation=recommendation
    )


@router.get("/risk-tolerance/info")
async def get_risk_assessment_info():
    """
    Get information about the risk tolerance assessment quiz.
    Useful for frontend to display questions without hardcoding.
    """
    return {
        "questions": [
            {
                "id": 1,
                "question": "When the stock market drops 20%, how do you typically react?",
                "options": [
                    {"value": 1, "label": "Panic and want to sell everything"},
                    {"value": 2, "label": "Worried but hold"},
                    {"value": 3, "label": "Neutral - stick to my plan"},
                    {"value": 4, "label": "See it as a buying opportunity"},
                    {"value": 5, "label": "Excited to buy more at lower prices"}
                ]
            },
            {
                "id": 2,
                "question": "What's your expected investment time horizon?",
                "options": [
                    {"value": 1, "label": "Less than 1 year"},
                    {"value": 2, "label": "1-3 years"},
                    {"value": 3, "label": "3-7 years"},
                    {"value": 4, "label": "7-15 years"},
                    {"value": 5, "label": "15+ years (long-term)"}
                ]
            },
            {
                "id": 3,
                "question": "How comfortable are you with portfolio volatility (ups and downs)?",
                "options": [
                    {"value": 1, "label": "Very uncomfortable - prefer stable returns"},
                    {"value": 2, "label": "Somewhat uncomfortable"},
                    {"value": 3, "label": "Neutral"},
                    {"value": 4, "label": "Comfortable with fluctuations"},
                    {"value": 5, "label": "Very comfortable - expect high volatility"}
                ]
            },
            {
                "id": 4,
                "question": "What's your investment experience level?",
                "options": [
                    {"value": 1, "label": "First-time investor"},
                    {"value": 2, "label": "Beginner (< 2 years)"},
                    {"value": 3, "label": "Intermediate (2-5 years)"},
                    {"value": 4, "label": "Advanced (5-10 years)"},
                    {"value": 5, "label": "Expert (10+ years)"}
                ]
            },
            {
                "id": 5,
                "question": "How's your financial situation?",
                "options": [
                    {"value": 1, "label": "Tight budget - need safety"},
                    {"value": 2, "label": "Moderate income - some stability needed"},
                    {"value": 3, "label": "Comfortable - can handle some risk"},
                    {"value": 4, "label": "Good income - can take calculated risks"},
                    {"value": 5, "label": "Excellent - can absorb potential losses"}
                ]
            }
        ],
        "score_ranges": {
            "conservative": {"min": 1.0, "max": 2.3, "description": "Capital preservation focus"},
            "moderate": {"min": 2.3, "max": 3.7, "description": "Balanced growth and stability"},
            "aggressive": {"min": 3.7, "max": 5.0, "description": "Growth and high returns focus"}
        }
    }
