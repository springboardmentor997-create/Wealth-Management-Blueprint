from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

class AssetTypeEnum(str, Enum):
    stock = 'stock'
    etf = 'etf'
    mutual_fund = 'mutual_fund'
    bond = 'bond'
    cash = 'cash'

class InvestmentBase(BaseModel):
    asset_type: AssetTypeEnum
    symbol: str
    units: float
    avg_buy_price: float
    cost_basis: float
    current_value: Optional[float] = None
    last_price: Optional[float] = None

class InvestmentCreate(InvestmentBase):
    pass

class InvestmentResponse(InvestmentBase):
    id: int
    user_id: int
    last_price_at: Optional[datetime] = None

    class Config:
        from_attributes = True