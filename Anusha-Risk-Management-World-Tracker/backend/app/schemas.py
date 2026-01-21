from pydantic import BaseModel, EmailStr  # pyright: ignore[reportMissingImports]
from typing import Optional, Dict, Any
from datetime import datetime, date
from app.models import (
    RiskProfile,
    KYCStatus,
    GoalType,
    GoalStatus,
    AssetType,
    TransactionType
)

# =========================
# USER SCHEMAS
# =========================

class UserBase(BaseModel):
    name: str
    email: EmailStr
    risk_profile: RiskProfile = RiskProfile.moderate


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    risk_profile: Optional[RiskProfile] = None


class UserResponse(UserBase):
    id: int
    kyc_status: KYCStatus
    created_at: datetime

    class Config:
        from_attributes = True


# =========================
# AUTH SCHEMAS
# =========================

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# =========================
# GOAL SCHEMAS
# =========================

class GoalBase(BaseModel):
    goal_type: GoalType
    target_amount: float
    target_date: date
    monthly_contribution: float
    status: GoalStatus = GoalStatus.active


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    goal_type: Optional[GoalType] = None
    target_amount: Optional[float] = None
    target_date: Optional[date] = None
    monthly_contribution: Optional[float] = None
    status: Optional[GoalStatus] = None


class GoalResponse(GoalBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# =========================
# INVESTMENT SCHEMAS
# =========================

class InvestmentBase(BaseModel):
    asset_type: AssetType
    symbol: str
    units: float
    avg_buy_price: float
    cost_basis: float


class InvestmentCreate(InvestmentBase):
    pass


class InvestmentUpdate(BaseModel):
    units: Optional[float] = None
    avg_buy_price: Optional[float] = None
    cost_basis: Optional[float] = None
    current_value: Optional[float] = None
    last_price: Optional[float] = None


class InvestmentResponse(InvestmentBase):
    id: int
    user_id: int
    current_value: Optional[float] = None
    last_price: Optional[float] = None
    last_price_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# =========================
# TRANSACTION SCHEMAS
# =========================

class TransactionBase(BaseModel):
    symbol: str
    type: TransactionType
    quantity: float
    price: float
    fees: float = 0


class TransactionCreate(TransactionBase):
    pass


class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    executed_at: datetime

    class Config:
        from_attributes = True


# =========================
# RECOMMENDATION SCHEMAS
# =========================

class RecommendationBase(BaseModel):
    title: str
    recommendation_text: Optional[str] = None
    suggested_allocation: Optional[Dict[str, Any]] = None


class RecommendationCreate(RecommendationBase):
    pass


class RecommendationResponse(RecommendationBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# =========================
# SIMULATION SCHEMAS
# =========================

class SimulationBase(BaseModel):
    goal_id: Optional[int] = None
    scenario_name: str
    assumptions: Optional[Dict[str, Any]] = None
    results: Optional[Dict[str, Any]] = None


class SimulationCreate(SimulationBase):
    pass


class SimulationResponse(SimulationBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
