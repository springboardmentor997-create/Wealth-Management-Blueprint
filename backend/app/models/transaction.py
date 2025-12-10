from sqlalchemy import Column, Integer, String, Numeric, Enum, ForeignKey, DateTime
from datetime import datetime
from app.core.database import Base

class Transaction(Base):
    __tablename__ = 'transactions'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    symbol = Column(String(50), nullable=False)
    
    type = Column(Enum('buy', 'sell', 'dividend', 'contribution', 'withdrawal', name='trx_type_enum'), nullable=False)
    quantity = Column(Numeric(10, 4), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    fees = Column(Numeric(10, 2), default=0.0)
    
    executed_at = Column(DateTime, default=datetime.utcnow)