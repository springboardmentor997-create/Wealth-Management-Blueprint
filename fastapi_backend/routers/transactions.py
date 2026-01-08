from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid

from database import get_db
from models import Transaction, User
from schemas import TransactionCreate, Transaction as TransactionSchema
from auth import get_current_user

router = APIRouter(prefix="/api/transactions", tags=["transactions"])

@router.get("/", response_model=List[TransactionSchema])
async def get_transactions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    return transactions

@router.post("/", response_model=TransactionSchema)
async def add_transaction(transaction_data: TransactionCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    transaction = Transaction(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        symbol=transaction_data.symbol,
        type=transaction_data.type,
        quantity=transaction_data.quantity,
        price=transaction_data.price
    )
    
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    
    return transaction