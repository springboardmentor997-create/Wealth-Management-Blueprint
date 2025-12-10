from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
from enum import Enum

class GoalTypeEnum(str, Enum):
    retirement = 'retirement'
    home = 'home'
    education = 'education'
    custom = 'custom'

class GoalStatusEnum(str, Enum):
    active = 'active'
    paused = 'paused'
    completed = 'completed'

class GoalBase(BaseModel):
    goal_type: GoalTypeEnum
    target_amount: float
    target_date: date
    monthly_contribution: float
    status: GoalStatusEnum = GoalStatusEnum.active

class GoalCreate(GoalBase):
    pass # No extra fields needed for creation

class GoalResponse(GoalBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True