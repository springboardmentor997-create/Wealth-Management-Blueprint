from pydantic import BaseModel, field_validator
from datetime import date, datetime
from typing import Optional

class GoalBase(BaseModel):
    # Allow title to be None/Null so the app doesn't crash
    title: Optional[str] = "Untitled Goal" 
    goal_type: Optional[str] = "General"
    target_amount: float
    current_amount: float = 0.0
    monthly_contribution: float = 0.0
    target_date: date

    # This fix handles the "date_from_datetime_inexact" error
    @field_validator('target_date', mode='before')
    @classmethod
    def parse_target_date(cls, v):
        if isinstance(v, datetime):
            return v.date() # Strip the time (5:30) off the date
        return v

class GoalCreate(GoalBase):
    pass

class GoalOut(GoalBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True