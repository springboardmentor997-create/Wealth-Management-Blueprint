from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from fastapi_backend.database import get_db
from .models import User
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Patch bcrypt for passlib compatibility (Fixes AttributeError: module 'bcrypt' has no attribute '__about__')
import bcrypt
if not hasattr(bcrypt, '__about__'):
    try:
        from collections import namedtuple
        Version = namedtuple('Version', ['__version__'])
        bcrypt.__about__ = Version(bcrypt.__version__)
    except Exception:
        pass

SECRET_KEY = "your-secret-key-here-change-in-production"
REFRESH_SECRET_KEY = "your-refresh-secret-key-change-in-production" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password, hashed_password):
    # Ensure plain_password is a string
    if not isinstance(plain_password, str):
        plain_password = str(plain_password)
    
    # Check if it's a simple hash (for admin user)
    import hashlib
    simple_hash = hashlib.sha256(plain_password.encode()).hexdigest()
    if simple_hash == hashed_password:
        return True
    
    # Otherwise use bcrypt
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False

def get_password_hash(password):
    print(f"Password received: {password} (type: {type(password)}, length: {len(password)})")
    # Ensure password is a string
    if not isinstance(password, str):
        password = str(password)

    # Truncate password if it's too long for bcrypt (72 bytes max)
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        # Truncate by bytes, not characters, to avoid encoding issues
        password = password_bytes[:72].decode('utf-8', errors='ignore')
        print(f"Password truncated to: {password} (length: {len(password)})")

    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            logger.warning("Token verification failed: No user_id in payload")
            return None
        return {"user_id": user_id}
    except JWTError as e:
        logger.warning(f"Token verification failed: {str(e)}")
        return None

def verify_refresh_token(token: str):
    try:
        payload = jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None or payload.get("type") != "refresh":
            return None
        return {"user_id": user_id}
    except JWTError:
        return None

def get_current_user(db: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    # Remove 'Bearer ' prefix if present
    if token.startswith('Bearer '):
        token = token[7:]
    
    token_data = verify_token(token)
    
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.id == token_data["user_id"]).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user