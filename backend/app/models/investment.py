from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship  # 👈 This import is CRITICAL
from app.core.database import Base

class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))  # Links to User table
    
    asset_name = Column(String)
    amount_invested = Column(Float)
    current_value = Column(Float)
    category = Column(String)
    units = Column(Float)
    date_invested = Column(DateTime(timezone=True), server_default=func.now())

    # 👇 THIS IS THE MISSING PART CAUSING THE ERROR
    user = relationship("User", back_populates="investments")