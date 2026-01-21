from fastapi import APIRouter, Depends, HTTPException, status # pyright: ignore[reportMissingImports]
from sqlalchemy.orm import Session # pyright: ignore[reportMissingImports]
from typing import List
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.services.market_data import get_stock_price, update_investment_prices
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=schemas.InvestmentResponse, status_code=status.HTTP_201_CREATED)
async def create_investment(
    investment: schemas.InvestmentCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_investment = models.Investment(**investment.model_dump(), user_id=current_user.id)
    db.add(db_investment)
    db.commit()
    db.refresh(db_investment)
    return db_investment

@router.get("/", response_model=List[schemas.InvestmentResponse])
async def get_investments(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    investments = db.query(models.Investment).filter(
        models.Investment.user_id == current_user.id
    ).all()
    return investments

@router.get("/{investment_id}", response_model=schemas.InvestmentResponse)
async def get_investment(
    investment_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    investment = db.query(models.Investment).filter(
        models.Investment.id == investment_id,
        models.Investment.user_id == current_user.id
    ).first()
    if not investment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found"
        )
    return investment

@router.put("/{investment_id}", response_model=schemas.InvestmentResponse)
async def update_investment(
    investment_id: int,
    investment_update: schemas.InvestmentUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    investment = db.query(models.Investment).filter(
        models.Investment.id == investment_id,
        models.Investment.user_id == current_user.id
    ).first()
    if not investment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found"
        )
    
    update_data = investment_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(investment, field, value)
    db.commit()
    db.refresh(investment)
    return investment

@router.delete("/{investment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_investment(
    investment_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    investment = db.query(models.Investment).filter(
        models.Investment.id == investment_id,
        models.Investment.user_id == current_user.id
    ).first()
    if not investment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found"
        )
    db.delete(investment)
    db.commit()
    return None

@router.post("/refresh-prices")
async def refresh_all_prices(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Manually refresh prices for all user investments
    """
    investments = db.query(models.Investment).filter(
        models.Investment.user_id == current_user.id
    ).all()
    
    updated_count = 0
    for investment in investments:
        price_data = await get_stock_price(investment.symbol)
        if price_data:
            investment.last_price = price_data["price"]
            investment.current_value = float(investment.units) * price_data["price"]
            investment.last_price_at = datetime.utcnow()
            updated_count += 1
    
    db.commit()
    return {"message": f"Updated {updated_count} investment prices", "updated_count": updated_count}

@router.post("/{investment_id}/refresh-price")
async def refresh_investment_price(
    investment_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Refresh price for a specific investment
    """
    investment = db.query(models.Investment).filter(
        models.Investment.id == investment_id,
        models.Investment.user_id == current_user.id
    ).first()
    
    if not investment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found"
        )
    
    price_data = await get_stock_price(investment.symbol)
    if price_data:
        investment.last_price = price_data["price"]
        investment.current_value = float(investment.units) * price_data["price"]
        investment.last_price_at = datetime.utcnow()
        db.commit()
        db.refresh(investment)
        return {"message": "Price updated", "investment": investment}
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not fetch price data"
        )

