from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from .config import settings  # Import your configured settings

# OAuth2PasswordBearer is a simple way to define security schemes
# The tokenUrl is where the client can submit username/password to get a token.
# Although we use custom /api/login, this is standard for OpenAPI specs.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")


# =================================================================
# 1. Token Creation Function
# =================================================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Creates a new JWT access token.
    
    Args:
        data: Payload data (e.g., {"sub": user_id}).
        expires_delta: Optional timedelta for custom expiration.
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        # Use the configured expiration time from settings
        expire = datetime.utcnow() + settings.ACCESS_TOKEN_EXPIRE_DELTA 

    to_encode.update({"exp": expire})
    
    # Encode the token using the secret key and algorithm from settings
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.JWT_SECRET_KEY, 
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


# =================================================================
# 2. Token Validation/Decoding Function (Dependency)
# =================================================================

def get_current_user_id(token: str = Depends(oauth2_scheme)) -> int:
    """
    Decodes the JWT token from the request and extracts the user ID.
    Raises an exception if the token is invalid or expired.
    
    Args:
        token: The raw JWT string, automatically extracted by OAuth2PasswordBearer.
        
    Returns:
        The user ID (int) embedded in the token payload.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode the token using the secret key
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET_KEY, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        # 'sub' (subject) is commonly used to hold the user ID
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        
        # Convert user ID back to an integer
        user_id = int(user_id_str)
        return user_id
        
    except JWTError:
        # This catches token errors, including expiration
        raise credentials_exception


# =================================================================
# 3. Utility Function (if you need the full user object)
# =================================================================
# This is a conceptual function that would fetch the User object from the DB
# using the ID returned by get_current_user_id.

# from sqlalchemy.orm import Session
# from .database import get_db
# from .models import User # Assuming User model is defined

# def get_current_user(
#     user_id: int = Depends(get_current_user_id), 
#     db: Session = Depends(get_db)
# ):
#     user = db.query(User).filter(User.id == user_id).first()
#     if user is None:
#         raise HTTPException(status_code=404, detail="User not found")
#     return user
