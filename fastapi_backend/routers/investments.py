from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid

from database import get_db
from models import Investment, User
from schemas import InvestmentCreate, Investment as InvestmentSchema
from auth import get_current_user

router = APIRouter(prefix="/api/investments", tags=["investments"])

@router.get("/", response_model=List[InvestmentSchema])
async def get_investments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
    return investments

@router.post("/", response_model=InvestmentSchema)
async def add_investment(investment_data: InvestmentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    investment = Investment(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        symbol=investment_data.symbol,
        asset_type=investment_data.asset_type,
        units=investment_data.units,
        avg_buy_price=investment_data.avg_buy_price,
        cost_basis=investment_data.units * investment_data.avg_buy_price,
        current_value=investment_data.units * investment_data.avg_buy_price,
        last_price=investment_data.avg_buy_price
    )
    
    db.add(investment)
    db.commit()
    db.refresh(investment)
    
    return investment