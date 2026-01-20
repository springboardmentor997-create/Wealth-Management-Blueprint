from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from core.database import get_session
from core.security import get_current_user
from models.user import User
from models.investment import Investment, AssetType
from models.transaction import Transaction, TransactionType

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])


class InvestmentCreate(BaseModel):
    asset_type: AssetType
    symbol: str
    units: Decimal
    avg_buy_price: Decimal
    cost_basis: Decimal
    current_value: Decimal
    last_price: Decimal | None = None


class InvestmentResponse(BaseModel):
    id: int
    user_id: int
    asset_type: AssetType
    symbol: str
    units: Decimal
    avg_buy_price: Decimal
    cost_basis: Decimal
    current_value: Decimal
    last_price: Decimal | None
    last_price_at: datetime | None

    class Config:
        from_attributes = True


class TransactionCreate(BaseModel):
    symbol: str
    type: TransactionType
    quantity: Decimal
    price: Decimal
    fees: Decimal = Decimal("0.0")


class TransactionResponse(BaseModel):
    id: int
    user_id: int
    symbol: str
    type: TransactionType
    quantity: Decimal
    price: Decimal
    fees: Decimal
    executed_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


# Investments
@router.post("/investments", response_model=InvestmentResponse, status_code=status.HTTP_201_CREATED)
def add_investment(inv_data: InvestmentCreate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    inv = Investment(
        user_id=current_user.id,
        **inv_data.dict()
    )
    session.add(inv)
    session.commit()
    session.refresh(inv)
    return inv


@router.get("/investments", response_model=list[InvestmentResponse])
def get_investments(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(
        select(Investment).where(Investment.user_id == current_user.id)
    ).all()


@router.get("/investments/{investment_id}", response_model=InvestmentResponse)
def get_investment(investment_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    inv = session.get(Investment, investment_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investment not found")
    if inv.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return inv


@router.put("/investments/{investment_id}", response_model=InvestmentResponse)
def update_investment(investment_id: int, inv_data: InvestmentCreate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    inv = session.get(Investment, investment_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investment not found")
    if inv.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = inv_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(inv, key, value)
    session.commit()
    session.refresh(inv)
    return inv


@router.delete("/investments/{investment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_investment(investment_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    inv = session.get(Investment, investment_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investment not found")
    if inv.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    session.delete(inv)
    session.commit()
    return None


# Transactions
@router.post("/transactions", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def add_transaction(tx_data: TransactionCreate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    tx = Transaction(
        user_id=current_user.id,
        **tx_data.dict()
    )
    session.add(tx)
    session.commit()
    session.refresh(tx)
    return tx


@router.get("/transactions", response_model=list[TransactionResponse])
def get_transactions(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(
        select(Transaction).where(Transaction.user_id == current_user.id)
    ).all()


@router.get("/transactions/{transaction_id}", response_model=TransactionResponse)
def get_transaction(transaction_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    tx = session.get(Transaction, transaction_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if tx.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return tx


@router.delete("/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(transaction_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    tx = session.get(Transaction, transaction_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if tx.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    session.delete(tx)
    session.commit()
    return None
