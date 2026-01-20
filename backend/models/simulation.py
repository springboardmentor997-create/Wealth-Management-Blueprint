from sqlmodel import SQLModel, Field
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from typing import Optional, Dict, Any


class Simulation(SQLModel, table=True):
    __tablename__ = "simulations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    goal_id: Optional[int] = Field(default=None, foreign_key="goals.id")

    scenario_name: str

    assumptions: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB))
    results: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB))

    created_at: datetime = Field(default_factory=datetime.utcnow)
