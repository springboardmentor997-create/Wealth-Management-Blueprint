from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from core.database import get_session
from core.security import get_current_user
from models.user import User
from models.simulation import Simulation

router = APIRouter(prefix="/simulations", tags=["Simulations"])


class SimulationCreate(BaseModel):
    scenario_name: str
    assumptions: Dict[str, Any]
    goal_id: Optional[int] = None


class SimulationResponse(BaseModel):
    id: int
    user_id: int
    scenario_name: str
    assumptions: Any
    results: Any
    goal_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


@router.post("/", response_model=SimulationResponse, status_code=status.HTTP_201_CREATED)
def run_simulation(sim_data: SimulationCreate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    from services.simulation_service import calculate_compound_interest
    
    # Extract assumptions with defaults
    assumptions = sim_data.assumptions or {}
    initial_amount = float(assumptions.get("initial_amount", 0))
    monthly_contribution = float(assumptions.get("monthly_contribution", 0))
    rate = float(assumptions.get("rate", 7.0))
    years = int(assumptions.get("years", 10))
    inflation_rate = float(assumptions.get("inflation_rate", 0.0))
    
    # Calculate results
    sim_results = calculate_compound_interest(
        initial_amount=initial_amount,
        monthly_contribution=monthly_contribution,
        annual_interest_rate=rate,
        years=years,
        inflation_rate=inflation_rate
    )

    new_sim = Simulation(
        user_id=current_user.id,
        scenario_name=sim_data.scenario_name,
        assumptions=sim_data.assumptions,
        goal_id=sim_data.goal_id,
        results=sim_results
    )
    session.add(new_sim)
    session.commit()
    session.refresh(new_sim)
    return new_sim


@router.get("/", response_model=list[SimulationResponse])
def get_simulations(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(
        select(Simulation).where(Simulation.user_id == current_user.id)
    ).all()


@router.get("/{sim_id}", response_model=SimulationResponse)
def get_simulation(sim_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    sim = session.get(Simulation, sim_id)
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
    if sim.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return sim


@router.delete("/{sim_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_simulation(sim_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    sim = session.get(Simulation, sim_id)
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
    if sim.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    session.delete(sim)
    session.commit()
    return None

