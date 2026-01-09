from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
import enum

class TransactionType(enum.Enum):
    buy = "buy"
    sell = "sell"
    dividend = "dividend"
    contribution = "contribution"
    withdrawal = "withdrawal"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    symbol = Column(String, nullable=False) # e.g., "GOLDBEES" 
    type = Column(SQLEnum(TransactionType), nullable=False)
    quantity = Column(Numeric(precision=15, scale=4), nullable=False)
    price = Column(Numeric(precision=15, scale=2), nullable=False)
    fees = Column(Numeric(precision=15, scale=2), default=0.0)
    executed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="transactions")