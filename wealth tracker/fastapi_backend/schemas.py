from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List, Literal
from datetime import datetime
from decimal import Decimal
from enum import Enum

# Enums
class RiskProfileEnum(str, Enum):
    conservative = "conservative"
    moderate = "moderate"
    aggressive = "aggressive"

class GoalTypeEnum(str, Enum):
    retirement = "retirement"
    home = "home"
    education = "education"
    custom = "custom"

class GoalStatusEnum(str, Enum):
    active = "active"
    paused = "paused"
    completed = "completed"

class AssetTypeEnum(str, Enum):
    stock = "stock"
    etf = "etf"
    mutual_fund = "mutual_fund"
    bond = "bond"
    cash = "cash"

class TransactionTypeEnum(str, Enum):
    buy = "buy"
    sell = "sell"
    dividend = "dividend"
    contribution = "contribution"
    withdrawal = "withdrawal"

# Auth Schemas
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    risk_profile: Optional[RiskProfileEnum] = "moderate"
    
    @validator('password')
    def validate_password(cls, v):
        if not isinstance(v, str):
            v = str(v)
        if len(v) < 1:
            raise ValueError('Password cannot be empty')
        password_bytes = v.encode('utf-8')
        if len(password_bytes) > 72:
            raise ValueError('Password cannot be longer than 72 bytes')
        return v

class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str

    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password too long (max 72 bytes)')
        return v

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    risk_profile: Optional[RiskProfileEnum] = None
    kyc_status: Optional[str] = None
    profile_picture: Optional[str] = None

class KYCCreate(BaseModel):
    full_name: str
    dob: str
    document_type: str
    document_number: str
    address: str

class KYCResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    dob: str
    document_type: str
    document_number: str
    address: str
    document_proof_url: Optional[str] = None
    status: str
    admin_comments: Optional[str] = None
    submitted_at: datetime
    verified_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class KYCStatusUpdate(BaseModel):
    status: str # verified, rejected
    admin_comments: Optional[str] = None

class AdminUserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    risk_profile: Optional[RiskProfileEnum] = None
    kyc_status: Optional[str] = None
    is_admin: Optional[str] = None
    credits: Optional[float] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str
    name: str
    email: str
    risk_profile: Optional[str] = "moderate"
    kyc_status: Optional[str] = "unverified"
    is_admin: Optional[str] = "false"
    profile_picture: Optional[str] = None
    credits: Optional[float] = 0.0
    login_count: Optional[int] = 0
    last_login: Optional[datetime] = None
    created_at: Optional[datetime] = None

    @validator('risk_profile', pre=True, always=True)
    def set_risk_profile(cls, v):
        return v or "moderate"
    
    @validator('kyc_status', pre=True, always=True)
    def set_kyc_status(cls, v):
        return v or "unverified"
    
    @validator('is_admin', pre=True, always=True)
    def set_is_admin(cls, v):
        return v or "false"
    
    @validator('credits', pre=True, always=True)
    def set_credits(cls, v):
        return v if v is not None else 0.0
    
    @validator('login_count', pre=True, always=True)
    def set_login_count(cls, v):
        return v if v is not None else 0

    class Config:
        from_attributes = True

class AdminUserView(User):
    password: Optional[str] = ""  # Hashed password
    
    @validator('password', pre=True, always=True)
    def set_password(cls, v):
        return v or ""

class AuthResponse(BaseModel):
    user: User
    token: str
    refresh_token: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class CreditUpdate(BaseModel):
    amount: float
    action: Literal["add", "deduct"]

# Goal Schemas
class GoalCreate(BaseModel):
    title: str
    goal_type: GoalTypeEnum
    target_amount: float
    current_amount: Optional[float] = 0
    monthly_contribution: float
    target_date: str

class Goal(BaseModel):
    id: str
    user_id: str
    title: str
    goal_type: str
    target_amount: float
    current_amount: float
    monthly_contribution: float
    target_date: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Investment Schemas
class InvestmentCreate(BaseModel):
    asset_type: AssetTypeEnum
    symbol: str
    units: float
    avg_buy_price: float

class Investment(BaseModel):
    id: str
    symbol: str
    asset_type: str
    units: float
    avg_buy_price: float
    cost_basis: Optional[float]
    current_value: Optional[float]
    last_price: Optional[float]

    class Config:
        from_attributes = True

# Transaction Schemas
class TransactionCreate(BaseModel):
    symbol: str
    type: TransactionTypeEnum
    quantity: float
    price: float
    fees: Optional[float] = 0

class Transaction(BaseModel):
    id: str
    symbol: str
    type: str
    quantity: float
    price: float
    executed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
# Portfolio Schemas
class PortfolioSummary(BaseModel):
    total_value: float
    total_cost_basis: float
    total_gain_loss: float
    monthly_growth_percentage: float

# Simulation Schemas
class SimulationRequest(BaseModel):
    annual_return: float
    inflation_rate: float
    additional_contribution: float
    years_to_simulate: int

class AdhocSimulationRequest(SimulationRequest):
    initial_amount: float
    target_amount: Optional[float] = 0

class SimulationResult(BaseModel):
    projected_value: float
    total_contributions: float
    investment_growth: float
    goal_achievement_percentage: float
    insights: List[str]
    projection_data: Optional[List[dict]] = []

class Simulation(BaseModel):
    id: str
    user_id: str
    goal_id: Optional[str]
    scenario_name: Optional[str]
    assumptions: SimulationRequest
    results: SimulationResult
    created_at: datetime

    class Config:
        from_attributes = True

# Recommendation Schemas
class Recommendation(BaseModel):
    id: int
    title: str
    description: str
    priority: str
    expected_impact: str
    action_link: Optional[str] = None

# Market Schemas
class MarketIndex(BaseModel):
    name: str
    symbol: str
    price: float
    change: float
    change_percent: float

class MarketNews(BaseModel):
    id: int
    title: str
    source: str
    time: str
    sentiment: str

class MarketUpdateResponse(BaseModel):
    message: str

# Notification Schemas
class NotificationCreate(BaseModel):
    title: str
    message: str
    type: Optional[str] = "info"

class Notification(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str
    is_read: str
    created_at: datetime

    class Config:
        from_attributes = True

# Admin Schemas
class ActivityLogItem(BaseModel):
    id: str
    user_id: str
    user_name: str
    action: str
    category: str
    details: str
    timestamp: datetime
    document_url: Optional[str] = None

class AdminDashboardData(BaseModel):
    total_users: int
    total_goals: int
    total_investments: int
    total_transactions: int
    total_goals_completed: int
    total_portfolio_value: float
    recent_activities: List[ActivityLogItem] = []
    user_growth: List[dict] = []
    goal_performance: List[dict] = []


class RebalanceRecommendation(BaseModel):
    asset_class: str
    current_percentage: float
    target_percentage: float
    action: Optional[str]
# =========================
# Dashboard Schema
# =========================

from pydantic import BaseModel
from typing import List, Optional

# Report File Schemas
class ReportFileCreate(BaseModel):
    name: str
    type: str
    size: int

class ReportFileResponse(BaseModel):
    id: str
    name: str
    type: str
    size: int
    status: str
    uploaded_at: datetime

    class Config:
        from_attributes = True

# Dashboard Schema
class DashboardData(BaseModel):
    total_portfolio_value: float
    total_goals: int
    active_goals: int
    total_investments: int
    recent_transactions: Optional[List[dict]] = []
    portfolio_performance: dict
