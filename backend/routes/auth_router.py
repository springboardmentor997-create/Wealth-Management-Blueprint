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
from google.auth.transport import requests
from google.oauth2 import id_token
from core.config import settings
import requests as http_requests
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


class GoogleLoginPayload(BaseModel):
    token: str


class GoogleCodePayload(BaseModel):
    code: str


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


@router.post("/google-login")
def google_login(payload: GoogleLoginPayload, session: Session = Depends(get_session)):
    """Login or register user with Google OAuth token"""
    try:
        # Verify the Google ID token
        idinfo = id_token.verify_oauth2_token(
            payload.token,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )

        # Extract user information from token
        email = idinfo.get('email')
        name = idinfo.get('name', email.split('@')[0])
        google_id = idinfo.get('sub')

        if not email:
            raise HTTPException(status_code=400, detail="Email not found in Google token")

        # Check if user exists
        user = session.exec(select(User).where(User.email == email)).first()

        if not user:
            # Create new user from Google data
            # Generate a random password for Google-registered users
            random_password = secrets.token_urlsafe(16)
            user = User(
                name=name,
                email=email,
                password=get_password_hash(random_password),
                risk_profile="moderate"
            )
            session.add(user)
            session.commit()
            session.refresh(user)

        # Create JWT token
        token = create_access_token({"sub": str(user.id), "email": user.email})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "risk_profile": user.risk_profile
            }
        }

    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Google authentication failed: {str(e)}")


@router.post("/google-callback")
def google_callback(payload: GoogleCodePayload, session: Session = Depends(get_session)):
    """
    Secure OAuth 2.0 Authorization Code Flow callback.
    Frontend sends authorization code, backend exchanges it for tokens.
    """
    try:
        # Exchange authorization code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        
        token_data = {
            "code": payload.code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": "postmessage",  # Required for React Google Login hook (Popup flow)
            "grant_type": "authorization_code"
        }
        
        # Make request to Google's token endpoint
        token_response = http_requests.post(token_url, data=token_data)
        
        if token_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Failed to exchange authorization code")
        
        token_json = token_response.json()
        id_token_str = token_json.get("id_token")
        
        if not id_token_str:
            raise HTTPException(status_code=401, detail="No ID token in response")
        
        # Verify the ID token
        idinfo = id_token.verify_oauth2_token(
            id_token_str,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
        
        # Extract user information
        email = idinfo.get('email')
        name = idinfo.get('name', email.split('@')[0])
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not found in Google token")
        
        # Check if user exists, create if not
        user = session.exec(select(User).where(User.email == email)).first()
        
        if not user:
            # Create new user from Google data
            random_password = secrets.token_urlsafe(16)
            user = User(
                name=name,
                email=email,
                password=get_password_hash(random_password),
                risk_profile="moderate"
            )
            session.add(user)
            session.commit()
            session.refresh(user)
        
        # Create JWT token for our app
        jwt_token = create_access_token({"sub": str(user.id), "email": user.email})
        return {
            "access_token": jwt_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "risk_profile": user.risk_profile
            }
        }
    
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")
    except http_requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Google token exchange failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Google authentication failed: {str(e)}")
