from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from datetime import datetime

from database import get_db
from models import User, Simulation as SimulationModel, Goal as GoalModel
from schemas import SimulationRequest, SimulationResult, Simulation, AdhocSimulationRequest
from auth import get_current_user

router = APIRouter(prefix="/api/simulations", tags=["simulations"])

@router.post("/adhoc", response_model=Simulation)
async def run_adhoc_simulation(
    assumptions: AdhocSimulationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    monthly_contribution = assumptions.additional_contribution
    years = assumptions.years_to_simulate
    
    # Calculate real return rate
    nominal_return = assumptions.annual_return / 100
    inflation = assumptions.inflation_rate / 100
    real_return = (1 + nominal_return) / (1 + inflation) - 1
    
    current_amount = assumptions.initial_amount
    projection_data = []
    
    conservative = current_amount
    moderate = current_amount
    aggressive = current_amount
    
    for year in range(years + 1):
        projection_data.append({
            "year": f"Year {year}",
            "conservative": round(conservative),
            "moderate": round(moderate),
            "aggressive": round(aggressive),
            "target": assumptions.target_amount
        })
        
        conservative = conservative * (1 + (real_return - 0.02)) + monthly_contribution * 12
        moderate = moderate * (1 + real_return) + monthly_contribution * 12
        aggressive = aggressive * (1 + (real_return + 0.02)) + monthly_contribution * 12

    final_amount = moderate
    total_contributions = current_amount + (monthly_contribution * 12 * years)
    investment_growth = final_amount - total_contributions
    
    goal_achievement_percentage = 0
    if assumptions.target_amount > 0:
        goal_achievement_percentage = min(100, round((final_amount / assumptions.target_amount) * 100, 1))
    else:
        goal_achievement_percentage = 100 # No target, so effectively achieved

    insights = [
        f"Projected value in {years} years: Rs{round(final_amount):,}",
    ]
    
    if assumptions.target_amount > 0:
        if goal_achievement_percentage < 100:
            shortfall = assumptions.target_amount - final_amount
            insights.append(f"Projected shortfall: Rs{round(shortfall):,}")
            insights.append("Consider increasing monthly contribution")
        else:
            insights.append("You are on track to exceed your target!")
    
    result = SimulationResult(
        projected_value=final_amount,
        total_contributions=total_contributions,
        investment_growth=investment_growth,
        goal_achievement_percentage=goal_achievement_percentage,
        insights=insights,
        projection_data=projection_data
    )

    # Note: We don't save adhoc simulations to DB to keep it clean, 
    # but we return a Simulation object structure for frontend consistency.
    # We generate a temp ID.
    return Simulation(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        goal_id=None,
        scenario_name="Ad-hoc Simulation",
        assumptions=assumptions, # Pydantic will filter this to base class fields if not careful, but won't crash
        results=result,
        created_at=datetime.now()
    )

@router.post("/goal/{goal_id}", response_model=Simulation)
async def run_goal_simulation(
    goal_id: str, 
    assumptions: SimulationRequest, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Fetch goal
    goal = db.query(GoalModel).filter(GoalModel.id == goal_id, GoalModel.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Simulation calculation
    monthly_contribution = assumptions.additional_contribution or goal.monthly_contribution
    years = assumptions.years_to_simulate
    
    # Calculate real return rate adjusting for inflation
    # Real Return = (1 + Nominal) / (1 + Inflation) - 1
    nominal_return = assumptions.annual_return / 100
    inflation = assumptions.inflation_rate / 100
    real_return = (1 + nominal_return) / (1 + inflation) - 1
    
    current_amount = goal.current_amount
    projection_data = []
    
    conservative = current_amount
    moderate = current_amount
    aggressive = current_amount
    
    for year in range(years + 1):
        projection_data.append({
            "year": f"Year {year}",
            "conservative": round(conservative),
            "moderate": round(moderate),
            "aggressive": round(aggressive),
            "target": goal.target_amount
        })
        
        # Apply real return rates for projection (purchasing power)
        # Conservative: -2% from base
        # Moderate: base real return
        # Aggressive: +2% from base
        
        conservative = conservative * (1 + (real_return - 0.02)) + monthly_contribution * 12
        moderate = moderate * (1 + real_return) + monthly_contribution * 12
        aggressive = aggressive * (1 + (real_return + 0.02)) + monthly_contribution * 12

    # Calculate final results based on moderate scenario
    final_amount = moderate
    total_contributions = goal.current_amount + (monthly_contribution * 12 * years)
    investment_growth = final_amount - total_contributions
    goal_achievement_percentage = min(100, round((final_amount / goal.target_amount) * 100, 1))
    
    insights = [
        f"You are on track to achieve {goal_achievement_percentage}% of your goal",
        f"Projected value in {years} years: ₹{round(final_amount):,}",
    ]
    
    if goal_achievement_percentage < 100:
        shortfall = goal.target_amount - final_amount
        insights.append(f"Projected shortfall: ₹{round(shortfall):,}")
        insights.append("Consider increasing monthly contribution")
    else:
        insights.append("You are on track to exceed your goal!")
    
    result = SimulationResult(
        projected_value=final_amount,
        total_contributions=total_contributions,
        investment_growth=investment_growth,
        goal_achievement_percentage=goal_achievement_percentage,
        insights=insights,
        projection_data=projection_data
    )

    # Save to database
    db_simulation = SimulationModel(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        goal_id=goal_id,
        scenario_name=f"Simulation for Goal {goal.title}",
        assumptions=assumptions.dict(),
        results=result.dict()
    )
    
    db.add(db_simulation)
    db.commit()
    db.refresh(db_simulation)
    
    return db_simulation