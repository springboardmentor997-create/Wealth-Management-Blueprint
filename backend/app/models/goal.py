from sqlalchemy import Column, Integer, String, Numeric, Date, Enum, ForeignKey, DateTime
from datetime import datetime
from app.core.database import Base

class Goal(Base):
    __tablename__ = 'goals'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    goal_type = Column(Enum('retirement', 'home', 'education', 'custom', name='goal_type_enum'), nullable=False)
    target_amount = Column(Numeric(10, 2), nullable=False)
    target_date = Column(Date, nullable=False)
    monthly_contribution = Column(Numeric(10, 2), nullable=False)
    
    status = Column(Enum('active', 'paused', 'completed', name='goal_status_enum'), default='active')
    created_at = Column(DateTime, default=datetime.utcnow)