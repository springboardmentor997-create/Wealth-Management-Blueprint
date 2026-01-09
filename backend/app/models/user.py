from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="user")
    
    # 👇 CHANGED TO SIMPLE STRING (Removes the Enum error)
    phone = Column(String, nullable=True)
    kyc_status = Column(String, default="Not Verified")
    risk_profile = Column(String, default="Moderate")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    investments = relationship("Investment", back_populates="user")
    goals = relationship("Goal", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")