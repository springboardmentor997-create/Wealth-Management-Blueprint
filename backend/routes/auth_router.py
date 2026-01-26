from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlmodel import select
from core.database import get_session
from sqlmodel import Session
from models.user import User
from core.security import get_password_hash, verify_password, create_access_token
from services.email_service import send_password_reset_email
import secrets
from datetime import datetime, timedelta

import json

router = APIRouter(prefix="/auth", tags=["Auth"])


class RegisterPayload(BaseModel):
    name: str
    email: EmailStr
    password: str
    risk_profile: str | None = "moderate"


class LoginPayload(BaseModel):
    email: EmailStr
    password: str


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterPayload, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.email == payload.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=payload.name,
        email=payload.email,
        password=get_password_hash(payload.password),
        risk_profile=payload.risk_profile or "moderate"
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    return {"id": user.id, "name": user.name, "email": user.email, "risk_profile": user.risk_profile}


@router.post("/login")
def login(payload: LoginPayload, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == payload.email)).first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "name": user.name, "email": user.email, "risk_profile": user.risk_profile}}


class ForgotPasswordPayload(BaseModel):
    email: EmailStr


class ResetPasswordPayload(BaseModel):
    email: EmailStr
    token: str
    new_password: str





@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordPayload, session: Session = Depends(get_session)):
    """Generate password reset token and send via email"""
    user = session.exec(select(User).where(User.email == payload.email)).first()
    if not user:
        # Don't reveal if email exists for security reasons
        return {"message": "If email exists, reset link will be sent"}

    # Generate a secure reset token
    reset_token = secrets.token_urlsafe(32)
    reset_token_expiry = datetime.utcnow() + timedelta(hours=24)

    user.reset_token = reset_token
    user.reset_token_expiry = reset_token_expiry

    session.add(user)
    session.commit()

    # Send email with reset token
    send_password_reset_email(user.email, reset_token, user.name)

    # Return generic message (don't expose if email was sent or not)
    return {"message": "If the email exists in our system, you'll receive a password reset link shortly"}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordPayload, session: Session = Depends(get_session)):
    """Reset user password using token"""
    user = session.exec(select(User).where(User.email == payload.email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Verify token exists and hasn't expired
    if not user.reset_token or user.reset_token != payload.token:
        raise HTTPException(status_code=400, detail="Invalid reset token")

    if user.reset_token_expiry and user.reset_token_expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reset token expired")

    # Update password
    user.password = get_password_hash(payload.new_password)
    user.reset_token = None
    user.reset_token_expiry = None

    session.add(user)
    session.commit()

    return {"message": "Password reset successfully"}



