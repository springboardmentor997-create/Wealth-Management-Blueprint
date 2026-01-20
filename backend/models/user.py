from sqlmodel import SQLModel, Field
from enum import Enum
from datetime import datetime
from typing import Optional

class RiskProfile(str, Enum):
    conservative = "conservative"
    moderate = "moderate"
    aggressive = "aggressive"

class KYCStatus(str, Enum):
    unverified = "unverified"
    verified = "verified"

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    password: str

    risk_profile: RiskProfile
    kyc_status: KYCStatus = Field(default=KYCStatus.unverified)

    # Password reset fields
    reset_token: Optional[str] = Field(default=None, index=True)
    reset_token_expiry: Optional[datetime] = Field(default=None)

    created_at: datetime = Field(default_factory=datetime.utcnow)
