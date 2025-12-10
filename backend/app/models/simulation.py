from sqlalchemy import Column, Integer, String, JSON, ForeignKey, DateTime
from datetime import datetime
from app.core.database import Base

class Simulation(Base):
    __tablename__ = 'simulations'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    goal_id = Column(Integer, ForeignKey('goals.id'), nullable=True) # Nullable per schema
    
    scenario_name = Column(String(255), nullable=False)
    assumptions = Column(JSON, nullable=True)
    results = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)