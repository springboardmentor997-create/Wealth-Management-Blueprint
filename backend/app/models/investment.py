from sqlalchemy import Column, Integer, String, Numeric, Enum, ForeignKey, DateTime
from datetime import datetime
from app.core.database import Base

class Investment(Base):
    __tablename__ = 'investments'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    asset_type = Column(Enum('stock', 'etf', 'mutual_fund', 'bond', 'cash', name='asset_type_enum'), nullable=False)
    symbol = Column(String(50), nullable=False)
    units = Column(Numeric(10, 4), nullable=False)
    
    avg_buy_price = Column(Numeric(10, 2), nullable=False)
    cost_basis = Column(Numeric(12, 2), nullable=False)
    current_value = Column(Numeric(12, 2), nullable=True)
    last_price = Column(Numeric(10, 2), nullable=True)
    
    last_price_at = Column(DateTime, default=datetime.utcnow)