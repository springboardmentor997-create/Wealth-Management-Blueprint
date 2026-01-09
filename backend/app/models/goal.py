from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    title = Column(String)
    goal_type = Column(String) # e.g., 'Retirement', 'Home'
    target_amount = Column(Float)
    current_amount = Column(Float, default=0.0)
    monthly_contribution = Column(Float, default=0.0)
    target_date = Column(Date) # This matches your frontend's 'target_date'
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="goals")