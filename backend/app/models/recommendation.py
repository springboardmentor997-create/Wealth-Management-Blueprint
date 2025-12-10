from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey, DateTime
from datetime import datetime
from app.core.database import Base

class Recommendation(Base):
    __tablename__ = 'recommendations'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    title = Column(String(255), nullable=False)
    recommendation_text = Column(Text, nullable=True)
    suggested_allocation = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)