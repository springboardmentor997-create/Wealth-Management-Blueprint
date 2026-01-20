from sqlmodel import SQLModel, Field
from enum import Enum
from datetime import datetime, date
from typing import Optional
from decimal import Decimal
from sqlalchemy import Column, Numeric


class GoalType(str, Enum):
    retirement = "retirement"
    home = "home"
    education = "education"
    custom = "custom"


class GoalStatus(str, Enum):
    active = "active"
    paused = "paused"
    completed = "completed"


class Goal(SQLModel, table=True):
    __tablename__ = "goals"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")

    goal_type: GoalType
    target_amount: Optional[Decimal] = Field(default=None, sa_column=Column(Numeric(18, 2)))
    target_date: date
    monthly_contribution: Optional[Decimal] = Field(default=None, sa_column=Column(Numeric(18, 2)))

    status: GoalStatus = Field(default=GoalStatus.active)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow})