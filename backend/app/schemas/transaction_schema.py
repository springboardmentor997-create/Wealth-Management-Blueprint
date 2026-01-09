from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

class TransactionType(str, Enum):
    buy = "buy"
    sell = "sell"
    dividend = "dividend"
    contribution = "contribution"
    withdrawal = "withdrawal"

class TransactionBase(BaseModel):
    symbol: str
    type: TransactionType
    quantity: float
    price: float
    fees: float = 0.0
    executed_at: Optional[datetime] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionOut(TransactionBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True