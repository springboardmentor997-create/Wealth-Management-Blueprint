from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid
import numpy as np

from database import get_db
from models import User, Goal
from schemas import SimulationRequest, AdhocSimulationRequest, SimulationResult
from auth import get_current_user

router = APIRouter(prefix="/api/simulations", tags=["simulations"])

class SimulationEngine:
    @staticmethod
    def monte_carlo_simulation(
        initial_amount: float,
        monthly_contribution: float,
        annual_return: float,
        volatility: float,
        years: int,
        simulations: int = 1000
    ) -> dict:
        """Run Monte Carlo simulation for investment projections"""
        
        months = years * 12
        monthly_return = annual_return / 12 / 100
        monthly_volatility = volatility / 12 / 100
        
        results = []
        projection_data = []
        
        for _ in range(simulations):
            portfolio_value = initial_amount
            monthly_values = [portfolio_value]
            
            for month in range(months):
                # Random return based on normal distribution
                random_return = np.random.normal(monthly_return, monthly_volatility)
                portfolio_value = portfolio_value * (1 + random_return) + monthly_contribution
                monthly_values.append(portfolio_value)
            
            results.append(portfolio_value)
        
        # Calculate statistics
        final_values = np.array(results)
        mean_value = np.mean(final_values)
        percentile_10 = np.percentile(final_values, 10)
        percentile_90 = np.percentile(final_values, 90)
        
        total_contributions = initial_amount + (monthly_contribution * months)
        investment_growth = mean_value - total_contributions
        
        # Generate insights
        insights = []
        if mean_value > total_contributions * 1.5:
            insights.append("Strong growth potential with current strategy")
        if percentile_10 < total_contributions:
            insights.append("Consider diversification to reduce downside risk")
        if investment_growth > total_contributions:
            insights.append("Investment growth exceeds total contributions")
        
        # Sample projection data (monthly averages) - Generate 3 scenarios
        sample_projection = []
        
        # Generate data points yearly
        for month in range(0, months + 1, 12):  # Yearly data points
            year = month // 12
            
            # Conservative scenario (lower return)
            conservative_value = initial_amount * ((1 + (annual_return * 0.6)/100) ** year) + \
                                monthly_contribution * 12 * year * ((1 + (annual_return * 0.6)/100) ** (year/2)) if year > 0 else initial_amount
            
            # Moderate scenario (base return)
            moderate_value = initial_amount * ((1 + annual_return/100) ** year) + \
                            monthly_contribution * 12 * year * ((1 + annual_return/100) ** (year/2)) if year > 0 else initial_amount
            
            # Aggressive scenario (higher return)
            aggressive_value = initial_amount * ((1 + (annual_return * 1.4)/100) ** year) + \
                              monthly_contribution * 12 * year * ((1 + (annual_return * 1.4)/100) ** (year/2)) if year > 0 else initial_amount
            
            sample_projection.append({
                "year": year,
                "conservative": round(max(conservative_value, initial_amount), 2),
                "moderate": round(max(moderate_value, initial_amount), 2),
                "aggressive": round(max(aggressive_value, initial_amount), 2),
                "target": 0  # Will be set from goal target if available
            })
        
        return {
            "mean_value": round(mean_value, 2),
            "percentile_10": round(percentile_10, 2),
            "percentile_90": round(percentile_90, 2),
            "total_contributions": round(total_contributions, 2),
            "investment_growth": round(investment_growth, 2),
            "projection_data": sample_projection,
            "insights": insights
        }

@router.post("/goal/{goal_id}", response_model=SimulationResult)
async def simulate_goal(
    goal_id: str,
    simulation_request: SimulationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Run simulation for a specific goal"""
    
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    # Run Monte Carlo simulation
    simulation_result = SimulationEngine.monte_carlo_simulation(
        initial_amount=goal.current_amount,
        monthly_contribution=goal.monthly_contribution,
        annual_return=simulation_request.annual_return,
        volatility=15.0,  # Default volatility
        years=simulation_request.years_to_simulate
    )
    
    # Update projection data with target value
    for data_point in simulation_result["projection_data"]:
        data_point["target"] = goal.target_amount
    
    # Calculate goal achievement percentage
    goal_achievement = min(100, (simulation_result["mean_value"] / goal.target_amount) * 100)
    
    return SimulationResult(
        projected_value=simulation_result["mean_value"],
        total_contributions=simulation_result["total_contributions"],
        investment_growth=simulation_result["investment_growth"],
        goal_achievement_percentage=round(goal_achievement, 2),
        insights=simulation_result["insights"],
        projection_data=simulation_result["projection_data"]
    )

@router.post("/adhoc", response_model=SimulationResult)
async def adhoc_simulation(
    simulation_request: AdhocSimulationRequest,
    current_user: User = Depends(get_current_user)
):
    """Run ad-hoc simulation without a specific goal"""
    
    # Run Monte Carlo simulation
    simulation_result = SimulationEngine.monte_carlo_simulation(
        initial_amount=simulation_request.initial_amount,
        monthly_contribution=simulation_request.additional_contribution,
        annual_return=simulation_request.annual_return,
        volatility=15.0,
        years=simulation_request.years_to_simulate
    )
    
    # Calculate goal achievement if target is provided
    goal_achievement = 100.0
    target_amount = 0
    if simulation_request.target_amount and simulation_request.target_amount > 0:
        goal_achievement = min(100, (simulation_result["mean_value"] / simulation_request.target_amount) * 100)
        target_amount = simulation_request.target_amount
    
    # Update projection data with target value
    for data_point in simulation_result["projection_data"]:
        data_point["target"] = target_amount
    
    return SimulationResult(
        projected_value=simulation_result["mean_value"],
        total_contributions=simulation_result["total_contributions"],
        investment_growth=simulation_result["investment_growth"],
        goal_achievement_percentage=round(goal_achievement, 2),
        insights=simulation_result["insights"],
        projection_data=simulation_result["projection_data"]
    )

@router.get("/scenarios")
async def get_simulation_scenarios(current_user: User = Depends(get_current_user)):
    """Get predefined simulation scenarios"""
    
    scenarios = [
        {
            "name": "Conservative",
            "annual_return": 6.0,
            "volatility": 8.0,
            "description": "Low risk, steady growth"
        },
        {
            "name": "Moderate",
            "annual_return": 10.0,
            "volatility": 15.0,
            "description": "Balanced risk and return"
        },
        {
            "name": "Aggressive",
            "annual_return": 15.0,
            "volatility": 25.0,
            "description": "High risk, high potential return"
        }
    ]
    
    return scenarios