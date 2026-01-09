from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    # These MUST have defaults, or the frontend must send them
    role: str = "user" 
    kyc_status: str = "Not Verified"
    risk_profile: Optional[str] = "Moderate"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# 👇 NEW: This validates data when user edits their profile
class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    risk_profile: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    role: str
    
    # 👇 NEW FIELDS (Must match your database)
    phone: Optional[str] = None
    risk_profile: Optional[str] = None
    kyc_status: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None