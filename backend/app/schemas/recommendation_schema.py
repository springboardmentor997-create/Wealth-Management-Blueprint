from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any

class RecommendationBase(BaseModel):
    title: str
    recommendation_text: Optional[str] = None
    suggested_allocation: Optional[Dict[str, Any]] = None # Handles JSON

class RecommendationCreate(RecommendationBase):
    pass

class RecommendationResponse(RecommendationBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True