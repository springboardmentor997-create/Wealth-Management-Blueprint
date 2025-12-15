from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Renamed from UserResponse to UserOut to match the Routers
class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    risk_profile: Optional[str] = None
    kyc_status: Optional[str] = None
    created_at: datetime  # Added this field

    class Config:
        from_attributes = True