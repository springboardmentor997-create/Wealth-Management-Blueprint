from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any

class SimulationBase(BaseModel):
    scenario_name: str
    assumptions: Optional[Dict[str, Any]] = None # Handles JSON
    results: Optional[Dict[str, Any]] = None     # Handles JSON

class SimulationCreate(SimulationBase):
    goal_id: Optional[int] = None

class SimulationResponse(SimulationBase):
    id: int
    user_id: int
    goal_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True