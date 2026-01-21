from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt # pyright: ignore[reportMissingModuleSource]
from passlib.context import CryptContext # pyright: ignore[reportMissingModuleSource]
from fastapi import Depends, HTTPException, status # pyright: ignore[reportMissingImports]
from fastapi.security import OAuth2PasswordBearer # pyright: ignore[reportMissingImports]
from sqlalchemy.orm import Session # pyright: ignore[reportMissingImports]

from app.database import get_db
from app import models
import os
from dotenv import load_dotenv # pyright: ignore[reportMissingImports]

# -------------------------------------------------
# ENV SETUP
# -------------------------------------------------

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-this-in-production-32chars")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# -------------------------------------------------
# SECURITY OBJECTS
# -------------------------------------------------

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)

# -------------------------------------------------
# PASSWORD HELPERS
# -------------------------------------------------

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# -------------------------------------------------
# TOKEN CREATION
# -------------------------------------------------

def create_access_token(
    subject: str,
    expires_delta: Optional[timedelta] = None
) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {
        "sub": subject,
        "type": "access",
        "exp": expire
    }

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(subject: str) -> str:
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode = {
        "sub": subject,
        "type": "refresh",
        "exp": expire
    }

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# -------------------------------------------------
# TOKEN VERIFICATION
# -------------------------------------------------

def verify_token(token: str, expected_type: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        token_type = payload.get("type")
        email = payload.get("sub")

        if token_type != expected_type or email is None:
            return None

        return email
    except JWTError:
        return None

# -------------------------------------------------
# AUTHENTICATION
# -------------------------------------------------

def authenticate_user(
    db: Session,
    email: str,
    password: str
) -> Optional[models.User]:
    user = db.query(models.User).filter(
        models.User.email == email
    ).first()

    if not user:
        return None

    if not verify_password(password, user.password):
        return None

    return user

# -------------------------------------------------
# CURRENT USER DEPENDENCY
# -------------------------------------------------

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    email = verify_token(token, "access")
    if email is None:
        raise credentials_exception

    user = db.query(models.User).filter(
        models.User.email == email
    ).first()

    if user is None:
        raise credentials_exception

    return user
