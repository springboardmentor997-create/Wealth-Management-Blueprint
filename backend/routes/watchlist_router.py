from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select
from core.database import get_session
from models.watchlist import Watchlist
from core.security import get_current_user
from models.user import User
from datetime import datetime

router = APIRouter(prefix="/watchlist", tags=["Watchlist"])


class WatchlistAddPayload(BaseModel):
    symbol: str  # e.g., "AAPL", "RELIANCE.NS"
    asset_type: str = "stock"  # stock, crypto, etf
    name: str  # Company/Asset name
    current_price: float
    target_price: float | None = None
    notes: str | None = None
    exchange: str | None = None
    sector: str | None = None


class WatchlistUpdatePayload(BaseModel):
    current_price: float | None = None
    target_price: float | None = None
    notes: str | None = None


class WatchlistResponse(BaseModel):
    id: int
    symbol: str
    asset_type: str
    name: str
    current_price: float
    price_at_added: float
    target_price: float | None
    notes: str | None
    price_change: float  # current - added
    price_change_percent: float
    added_at: datetime
    exchange: str | None
    sector: str | None


@router.post("/add", status_code=201)
async def add_to_watchlist(
    payload: WatchlistAddPayload,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user)
):
    """Add a stock/asset to user's watchlist"""
    
    # Check if already in watchlist
    existing = session.exec(
        select(Watchlist).where(
            (Watchlist.user_id == user.id) & (Watchlist.symbol == payload.symbol)
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"{payload.symbol} is already in your watchlist"
        )
    
    # Create new watchlist entry
    watchlist_item = Watchlist(
        user_id=user.id,
        symbol=payload.symbol,
        asset_type=payload.asset_type,
        name=payload.name,
        current_price=payload.current_price,
        price_at_added=payload.current_price,
        target_price=payload.target_price,
        notes=payload.notes,
        exchange=payload.exchange,
        sector=payload.sector
    )
    
    session.add(watchlist_item)
    session.commit()
    session.refresh(watchlist_item)
    
    price_change = watchlist_item.current_price - watchlist_item.price_at_added
    price_change_percent = (price_change / watchlist_item.price_at_added * 100) if watchlist_item.price_at_added > 0 else 0
    
    return WatchlistResponse(
        id=watchlist_item.id,
        symbol=watchlist_item.symbol,
        asset_type=watchlist_item.asset_type,
        name=watchlist_item.name,
        current_price=watchlist_item.current_price,
        price_at_added=watchlist_item.price_at_added,
        target_price=watchlist_item.target_price,
        notes=watchlist_item.notes,
        price_change=price_change,
        price_change_percent=round(price_change_percent, 2),
        added_at=watchlist_item.added_at,
        exchange=watchlist_item.exchange,
        sector=watchlist_item.sector
    )


@router.get("/all")
async def get_watchlist(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user)
):
    """Get user's complete watchlist"""
    
    items = session.exec(
        select(Watchlist).where(Watchlist.user_id == user.id).order_by(Watchlist.added_at.desc())
    ).all()
    
    result = []
    for item in items:
        price_change = item.current_price - item.price_at_added
        price_change_percent = (price_change / item.price_at_added * 100) if item.price_at_added > 0 else 0
        
        result.append(WatchlistResponse(
            id=item.id,
            symbol=item.symbol,
            asset_type=item.asset_type,
            name=item.name,
            current_price=item.current_price,
            price_at_added=item.price_at_added,
            target_price=item.target_price,
            notes=item.notes,
            price_change=price_change,
            price_change_percent=round(price_change_percent, 2),
            added_at=item.added_at,
            exchange=item.exchange,
            sector=item.sector
        ))
    
    return result


@router.get("/{watchlist_id}")
async def get_watchlist_item(
    watchlist_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user)
):
    """Get specific watchlist item"""
    
    item = session.exec(
        select(Watchlist).where(
            (Watchlist.id == watchlist_id) & (Watchlist.user_id == user.id)
        )
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Watchlist item not found")
    
    price_change = item.current_price - item.price_at_added
    price_change_percent = (price_change / item.price_at_added * 100) if item.price_at_added > 0 else 0
    
    return WatchlistResponse(
        id=item.id,
        symbol=item.symbol,
        asset_type=item.asset_type,
        name=item.name,
        current_price=item.current_price,
        price_at_added=item.price_at_added,
        target_price=item.target_price,
        notes=item.notes,
        price_change=price_change,
        price_change_percent=round(price_change_percent, 2),
        added_at=item.added_at,
        exchange=item.exchange,
        sector=item.sector
    )


@router.patch("/{watchlist_id}")
async def update_watchlist_item(
    watchlist_id: int,
    payload: WatchlistUpdatePayload,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user)
):
    """Update watchlist item (price, target, notes)"""
    
    item = session.exec(
        select(Watchlist).where(
            (Watchlist.id == watchlist_id) & (Watchlist.user_id == user.id)
        )
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Watchlist item not found")
    
    # Update fields if provided
    if payload.current_price is not None:
        item.current_price = payload.current_price
    if payload.target_price is not None:
        item.target_price = payload.target_price
    if payload.notes is not None:
        item.notes = payload.notes
    
    session.add(item)
    session.commit()
    session.refresh(item)
    
    price_change = item.current_price - item.price_at_added
    price_change_percent = (price_change / item.price_at_added * 100) if item.price_at_added > 0 else 0
    
    return WatchlistResponse(
        id=item.id,
        symbol=item.symbol,
        asset_type=item.asset_type,
        name=item.name,
        current_price=item.current_price,
        price_at_added=item.price_at_added,
        target_price=item.target_price,
        notes=item.notes,
        price_change=price_change,
        price_change_percent=round(price_change_percent, 2),
        added_at=item.added_at,
        exchange=item.exchange,
        sector=item.sector
    )


@router.delete("/{watchlist_id}")
async def remove_from_watchlist(
    watchlist_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user)
):
    """Remove item from watchlist"""
    
    item = session.exec(
        select(Watchlist).where(
            (Watchlist.id == watchlist_id) & (Watchlist.user_id == user.id)
        )
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Watchlist item not found")
    
    session.delete(item)
    session.commit()
    
    return {"message": f"{item.symbol} removed from watchlist"}


@router.get("/summary/stats")
async def get_watchlist_stats(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user)
):
    """Get watchlist statistics"""
    
    items = session.exec(
        select(Watchlist).where(Watchlist.user_id == user.id)
    ).all()
    
    if not items:
        return {
            "total_items": 0,
            "avg_price_change": 0,
            "gainers": 0,
            "losers": 0,
            "total_value": 0
        }
    
    total_items = len(items)
    gainers = sum(1 for item in items if item.current_price > item.price_at_added)
    losers = sum(1 for item in items if item.current_price < item.price_at_added)
    
    total_change = sum(item.current_price - item.price_at_added for item in items)
    avg_price_change = total_change / total_items if total_items > 0 else 0
    
    total_value = sum(item.current_price for item in items)
    
    return {
        "total_items": total_items,
        "avg_price_change": round(avg_price_change, 2),
        "gainers": gainers,
        "losers": losers,
        "total_value": round(total_value, 2)
    }
