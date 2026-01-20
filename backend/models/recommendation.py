from sqlmodel import SQLModel, Field
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from typing import Optional, Dict, Any


class Recommendation(SQLModel, table=True):
    __tablename__ = "recommendations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")

    title: str
    recommendation_text: str

    suggested_allocation: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB))

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="pending")
    priority: Optional[int] = Field(default=None)
    notes: Optional[str] = Field(default=None)
    related_goals: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB))
    related_simulations: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB))
    custom_metadata: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB))