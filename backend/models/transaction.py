from sqlmodel import SQLModel, Field
from enum import Enum
from datetime import datetime
from typing import Optional
from decimal import Decimal
from sqlalchemy import Column, Numeric


class TransactionType(str, Enum):
    buy = "buy"
    sell = "sell"
    dividend = "dividend"
    contribution = "contribution"
    withdrawal = "withdrawal"


class Transaction(SQLModel, table=True):
    __tablename__ = "transactions"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")

    symbol: str
    type: TransactionType

    quantity: Optional[Decimal] = Field(default=None, sa_column=Column(Numeric(20, 6)))
    price: Optional[Decimal] = Field(default=None, sa_column=Column(Numeric(18, 4)))
    fees: Optional[Decimal] = Field(default=Decimal("0.0"), sa_column=Column(Numeric(18, 4)))

    executed_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)