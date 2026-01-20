from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Watchlist(SQLModel, table=True):
    __tablename__ = "watchlists"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    
    # Stock/Asset information
    symbol: str = Field(index=True)  # e.g., "AAPL", "RELIANCE.NS"
    asset_type: str = Field(default="stock")  # stock, crypto, etf, etc.
    name: str  # e.g., "Apple Inc"
    current_price: float = Field(default=0.0)
    notes: Optional[str] = None  # User's personal notes
    
    # Tracking
    added_at: datetime = Field(default_factory=datetime.utcnow)
    price_at_added: float = Field(default=0.0)
    target_price: Optional[float] = None  # User's target buy/sell price
    
    # Metadata
    exchange: Optional[str] = None  # NSE, BSE, NASDAQ, etc.
    sector: Optional[str] = None
