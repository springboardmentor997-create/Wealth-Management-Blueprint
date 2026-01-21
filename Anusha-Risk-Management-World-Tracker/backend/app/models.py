from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, ForeignKey, Enum, Text, JSON # pyright: ignore[reportMissingImports]
from sqlalchemy.orm import relationship # pyright: ignore[reportMissingImports]
from sqlalchemy.sql import func # pyright: ignore[reportMissingImports]
from app.database import Base
import enum

# ---------- ENUMS ----------

class RiskProfile(str, enum.Enum):
    conservative = "conservative"
    moderate = "moderate"
    aggressive = "aggressive"

class KYCStatus(str, enum.Enum):
    unverified = "unverified"
    verified = "verified"

class GoalType(str, enum.Enum):
    retirement = "retirement"
    home = "home"
    education = "education"
    custom = "custom"

class GoalStatus(str, enum.Enum):
    active = "active"
    paused = "paused"
    completed = "completed"

class AssetType(str, enum.Enum):
    stock = "stock"
    etf = "etf"
    mutual_fund = "mutual_fund"
    bond = "bond"
    cash = "cash"

class TransactionType(str, enum.Enum):
    buy = "buy"
    sell = "sell"
    dividend = "dividend"
    contribution = "contribution"
    withdrawal = "withdrawal"


# ---------- MODELS ----------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    risk_profile = Column(Enum(RiskProfile), default=RiskProfile.moderate)
    kyc_status = Column(Enum(KYCStatus), default=KYCStatus.unverified)
    created_at = Column(DateTime, server_default=func.now())

    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    investments = relationship("Investment", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    simulations = relationship("Simulation", back_populates="user", cascade="all, delete-orphan")


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    goal_type = Column(Enum(GoalType), nullable=False)
    target_amount = Column(Numeric(15, 2), nullable=False)
    target_date = Column(Date, nullable=False)
    monthly_contribution = Column(Numeric(15, 2), nullable=False)
    status = Column(Enum(GoalStatus), default=GoalStatus.active)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="goals")
    simulations = relationship("Simulation", back_populates="goal", cascade="all, delete-orphan")


class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    asset_type = Column(Enum(AssetType), nullable=False)
    symbol = Column(String(50), nullable=False)
    units = Column(Numeric(15, 6), nullable=False)
    avg_buy_price = Column(Numeric(15, 2), nullable=False)
    cost_basis = Column(Numeric(15, 2), nullable=False)
    current_value = Column(Numeric(15, 2))
    last_price = Column(Numeric(15, 2))
    last_price_at = Column(DateTime)

    user = relationship("User", back_populates="investments")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    symbol = Column(String(50), nullable=False)
    type = Column(Enum(TransactionType), nullable=False)
    quantity = Column(Numeric(15, 6), nullable=False)
    price = Column(Numeric(15, 2), nullable=False)
    fees = Column(Numeric(15, 2), default=0)
    executed_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="transactions")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    recommendation_text = Column(Text)
    suggested_allocation = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="recommendations")


class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=True)
    scenario_name = Column(String(255), nullable=False)
    assumptions = Column(JSON)
    results = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="simulations")
    goal = relationship("Goal", back_populates="simulations")


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
