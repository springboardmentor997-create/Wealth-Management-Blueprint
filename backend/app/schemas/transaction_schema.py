from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

class TransactionTypeEnum(str, Enum):
    buy = 'buy'
    sell = 'sell'
    dividend = 'dividend'
    contribution = 'contribution'
    withdrawal = 'withdrawal'

class TransactionBase(BaseModel):
    symbol: str
    type: TransactionTypeEnum
    quantity: float
    price: float
    fees: float = 0.0

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    executed_at: datetime

    class Config:
        from_attributes = True