from fastapi import APIRouter, Depends, HTTPException, status # pyright: ignore[reportMissingImports]
from sqlalchemy.orm import Session # pyright: ignore[reportMissingImports]
from typing import List
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.services.simulations import calculate_goal_simulation, run_what_if_scenario
from datetime import date

router = APIRouter()

@router.post("/", response_model=schemas.SimulationResponse, status_code=status.HTTP_201_CREATED)
async def create_simulation(
    simulation: schemas.SimulationCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a simulation with assumptions and calculate results
    """
    results = None
    
    # If goal_id is provided, use goal data for simulation
    if simulation.goal_id:
        goal = db.query(models.Goal).filter(
            models.Goal.id == simulation.goal_id,
            models.Goal.user_id == current_user.id
        ).first()
        
        if not goal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Goal not found"
            )
        
        # Calculate current savings from portfolio
        investments = db.query(models.Investment).filter(
            models.Investment.user_id == current_user.id
        ).all()
        current_savings = sum(
            float(inv.current_value) if inv.current_value else float(inv.cost_basis)
            for inv in investments
        )
        
        # Extract assumptions or use defaults
        assumptions = simulation.assumptions or {}
        target_amount = assumptions.get("target_amount", float(goal.target_amount))
        target_date = assumptions.get("target_date", goal.target_date)
        monthly_contribution = assumptions.get("monthly_contribution", float(goal.monthly_contribution))
        annual_return_rate = assumptions.get("annual_return_rate", 7.0)
        inflation_rate = assumptions.get("inflation_rate", 3.0)
        
        # Run simulation
        sim_result = calculate_goal_simulation(
            target_amount=target_amount,
            target_date=target_date,
            monthly_contribution=monthly_contribution,
            current_savings=current_savings,
            annual_return_rate=annual_return_rate,
            inflation_rate=inflation_rate
        )
        
        results = sim_result
        assumptions = {
            "target_amount": target_amount,
            "target_date": target_date.isoformat() if isinstance(target_date, date) else str(target_date),
            "monthly_contribution": monthly_contribution,
            "annual_return_rate": annual_return_rate,
            "inflation_rate": inflation_rate,
            "current_savings": current_savings
        }
    else:
        # Standalone what-if scenario
        if not simulation.assumptions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assumptions required for standalone simulations"
            )
        
        assumptions = simulation.assumptions
        sim_result = run_what_if_scenario(
            base_target_amount=assumptions.get("target_amount", 0),
            base_target_date=date.fromisoformat(assumptions.get("target_date", date.today().isoformat())),
            base_monthly_contribution=assumptions.get("monthly_contribution", 0),
            scenario_name=simulation.scenario_name,
            assumptions=assumptions
        )
        results = sim_result["results"]
    
    db_simulation = models.Simulation(
        user_id=current_user.id,
        goal_id=simulation.goal_id,
        scenario_name=simulation.scenario_name,
        assumptions=assumptions,
        results=results
    )
    db.add(db_simulation)
    db.commit()
    db.refresh(db_simulation)
    return db_simulation

@router.get("/", response_model=List[schemas.SimulationResponse])
async def get_simulations(
    goal_id: int = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all simulations for the current user, optionally filtered by goal
    """
    query = db.query(models.Simulation).filter(
        models.Simulation.user_id == current_user.id
    )
    
    if goal_id:
        query = query.filter(models.Simulation.goal_id == goal_id)
    
    simulations = query.order_by(models.Simulation.created_at.desc()).all()
    return simulations

@router.get("/{simulation_id}", response_model=schemas.SimulationResponse)
async def get_simulation(
    simulation_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific simulation
    """
    simulation = db.query(models.Simulation).filter(
        models.Simulation.id == simulation_id,
        models.Simulation.user_id == current_user.id
    ).first()
    
    if not simulation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found"
        )
    
    return simulation

@router.post("/goal/{goal_id}/simulate", response_model=schemas.SimulationResponse)
async def simulate_goal(
    goal_id: int,
    assumptions: dict = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Quick simulation for a specific goal
    """
    goal = db.query(models.Goal).filter(
        models.Goal.id == goal_id,
        models.Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    # Get current portfolio value
    investments = db.query(models.Investment).filter(
        models.Investment.user_id == current_user.id
    ).all()
    current_savings = sum(
        float(inv.current_value) if inv.current_value else float(inv.cost_basis)
        for inv in investments
    )
    
    # Use provided assumptions or defaults
    assumptions = assumptions or {}
    annual_return_rate = assumptions.get("annual_return_rate", 7.0)
    inflation_rate = assumptions.get("inflation_rate", 3.0)
    
    result = calculate_goal_simulation(
        target_amount=float(goal.target_amount),
        target_date=goal.target_date,
        monthly_contribution=float(goal.monthly_contribution),
        current_savings=current_savings,
        annual_return_rate=annual_return_rate,
        inflation_rate=inflation_rate
    )
    
    db_simulation = models.Simulation(
        user_id=current_user.id,
        goal_id=goal_id,
        scenario_name=f"Simulation for {goal.goal_type.value} goal",
        assumptions={
            "annual_return_rate": annual_return_rate,
            "inflation_rate": inflation_rate,
            "current_savings": current_savings
        },
        results=result
    )
    db.add(db_simulation)
    db.commit()
    db.refresh(db_simulation)
    return db_simulation

