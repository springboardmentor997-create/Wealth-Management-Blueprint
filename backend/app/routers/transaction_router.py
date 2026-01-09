from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.investment import Investment
from app.models.transaction import Transaction
from app.schemas.transaction_schema import TransactionCreate, TransactionOut

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("/add", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def record_transaction(
    transaction: TransactionCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Create the Transaction Record
    new_tx = Transaction(**transaction.model_dump(), user_id=current_user.id)
    db.add(new_tx)

    # 2. Logic to Update the Investment Portfolio
    if transaction.type in [TransactionType.buy, TransactionType.sell]:
        # Search for an existing investment for this asset
        inv = db.query(Investment).filter(
            Investment.user_id == current_user.id,
            Investment.symbol == transaction.symbol
        ).first()

        change = transaction.quantity if transaction.type == TransactionType.buy else -transaction.quantity

        if inv:
            # Update existing investment
            inv.units = float(inv.units) + change
            # Optional: Update cost basis logic here
        elif transaction.type == TransactionType.buy:
            # Create a new investment entry if it doesn't exist
            new_inv = Investment(
                user_id=current_user.id,
                symbol=transaction.symbol,
                asset_type="stock",  # Defaulting, can be dynamic
                units=transaction.quantity,
                avg_buy_price=transaction.price,
                cost_basis=transaction.quantity * transaction.price,
                current_value=transaction.quantity * transaction.price
            )
            db.add(new_inv)

    db.commit()
    db.refresh(new_tx)
    return new_tx