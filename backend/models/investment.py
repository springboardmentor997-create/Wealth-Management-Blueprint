from sqlmodel import SQLModel, Field
from enum import Enum
from datetime import datetime
from typing import Optional
from decimal import Decimal
from sqlalchemy import Column, Numeric


class AssetType(str, Enum):
    stock = "stock"
    etf = "etf"
    mutual_fund = "mutual_fund"
    bond = "bond"
    cash = "cash"
    crypto = "crypto"


class Investment(SQLModel, table=True):
    __tablename__ = "investments"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")

    asset_type: AssetType
    symbol: str

    units: Optional[Decimal] = Field(default=None, sa_column=Column(Numeric(20, 6)))
    avg_buy_price: Optional[Decimal] = Field(default=None, sa_column=Column(Numeric(18, 4)))
    cost_basis: Optional[Decimal] = Field(default=None, sa_column=Column(Numeric(18, 2)))

    current_value: Optional[Decimal] = Field(default=None, sa_column=Column(Numeric(18, 2)))
    last_price: Optional[Decimal] = Field(default=None, sa_column=Column(Numeric(18, 4)))
    last_price_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)