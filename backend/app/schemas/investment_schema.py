from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class InvestmentBase(BaseModel):
    asset_name: str
    category: str
    amount_invested: float
    units: Optional[float] = 0.0

class InvestmentCreate(InvestmentBase):
    pass

class InvestmentOut(InvestmentBase):
    id: int
    user_id: int
    units: float
    current_value: float
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True