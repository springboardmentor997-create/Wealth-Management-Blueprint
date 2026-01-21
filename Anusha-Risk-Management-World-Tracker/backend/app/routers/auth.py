from fastapi import APIRouter, Depends, HTTPException, status # pyright: ignore[reportMissingImports]
from fastapi.security import OAuth2PasswordRequestForm # pyright: ignore[reportMissingImports]
from sqlalchemy.orm import Session # pyright: ignore[reportMissingImports]

from app.database import get_db
from app import models, schemas
from app.core.security import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    verify_token,
    get_password_hash,
    get_current_user
)

router = APIRouter(
    tags=["Auth"]
)


# ---------------- REGISTER ----------------
@router.post("/register", response_model=schemas.UserResponse, status_code=201)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    
    # 🧪 DEBUG: Print received payload
    print("🔍 REGISTER PAYLOAD RECEIVED:", user_data.model_dump())
    print("🔍 NAME FIELD:", user_data.name)
    print("🔍 EMAIL FIELD:", user_data.email)
    print("🔍 RISK_PROFILE FIELD:", user_data.risk_profile)
    print("🔍 RAW PAYLOAD DICT:", user_data.model_dump())

    existing_user = db.query(models.User).filter(
        models.User.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    try:
        new_user = models.User(
            name=user_data.name,
            email=user_data.email,
            password=get_password_hash(user_data.password),
            risk_profile=user_data.risk_profile
        )


        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print("✅ USER CREATED SUCCESSFULLY:", new_user.id)
        return new_user

    except Exception as e:
        db.rollback()
        print("❌ REGISTER ERROR:", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )
        raise HTTPException(status_code=500, detail=str(e))


# ---------------- LOGIN ----------------
@router.post("/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


# ---------------- REFRESH ----------------
@router.post("/refresh", response_model=schemas.Token)
def refresh(refresh_data: schemas.RefreshTokenRequest, db: Session = Depends(get_db)):

    email = verify_token(refresh_data.refresh_token, "refresh")

    if email is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = db.query(models.User).filter(models.User.email == email).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return {
        "access_token": create_access_token({"sub": email}),
        "refresh_token": create_refresh_token({"sub": email}),
        "token_type": "bearer"
    }


# ---------------- ME ----------------
@router.get("/me", response_model=schemas.UserResponse)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user
