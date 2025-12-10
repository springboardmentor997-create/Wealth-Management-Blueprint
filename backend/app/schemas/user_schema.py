from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum

# Define Enums to match your Database
class RiskProfileEnum(str, Enum):
    conservative = 'conservative'
    moderate = 'moderate'
    aggressive = 'aggressive'

class KYCStatusEnum(str, Enum):
    unverified = 'unverified'
    verified = 'verified'

# Base Schema (Shared properties)
class UserBase(BaseModel):
    name: str
    email: EmailStr
    risk_profile: RiskProfileEnum = RiskProfileEnum.moderate
    kyc_status: KYCStatusEnum = KYCStatusEnum.unverified

# Schema for Registering (Password is required)
class UserCreate(UserBase):
    password: str

# Schema for Logging In
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Schema for Reading (Return data without password)
class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True 