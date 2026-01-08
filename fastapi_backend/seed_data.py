from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, User, Goal, Investment, Transaction
from auth import get_password_hash
from datetime import datetime, timedelta
import uuid
import random

def seed_data():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Seeding database with realistic data...")
        
        # 1. Create Users
        users_data = [
            {
                "name": "John Doe",
                "email": "john@example.com",
                "risk_profile": "moderate",
                "kyc_status": "verified"
            },
            {
                "name": "Jane Smith",
                "email": "jane@example.com",
                "risk_profile": "aggressive",
                "kyc_status": "verified"
            },
            {
                "name": "Robert Johnson",
                "email": "robert@example.com",
                "risk_profile": "conservative",
                "kyc_status": "pending"
            },
            {
                "name": "Emily Davis",
                "email": "emily@example.com",
                "risk_profile": "moderate",
                "kyc_status": "verified"
            },
            {
                "name": "Michael Wilson",
                "email": "michael@example.com",
                "risk_profile": "aggressive",
                "kyc_status": "unverified"
            }
        ]
        
        created_users = []
        for u_data in users_data:
            # Check if user exists
            existing = db.query(User).filter(User.email == u_data["email"]).first()
            if not existing:
                user = User(
                    id=str(uuid.uuid4()),
                    name=u_data["name"],
                    email=u_data["email"],
                    password=get_password_hash("password123"),
                    risk_profile=u_data["risk_profile"],
                    kyc_status=u_data["kyc_status"],
                    is_admin="false",
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 365))
                )
                db.add(user)
                created_users.append(user)
                print(f"Created user: {user.name}")
            else:
                created_users.append(existing)
                print(f"User already exists: {existing.name}")
        
        db.commit()
        
        # 2. Create Goals for each user
        goal_types = ["retirement", "home", "education", "custom"]
        for user in created_users:
            # Check if user has goals
            if db.query(Goal).filter(Goal.user_id == user.id).count() == 0:
                num_goals = random.randint(1, 3)
                for _ in range(num_goals):
                    target = random.randint(10000, 1000000)
                    current = random.randint(0, int(target * 0.5))
                    goal = Goal(
                        id=str(uuid.uuid4()),
                        user_id=user.id,
                        title=f"{random.choice(['My', 'Future', 'Family'])} {random.choice(['Home', 'Car', 'Vacation', 'Retirement'])}",
                        goal_type=random.choice(goal_types),
                        target_amount=target,
                        current_amount=current,
                        monthly_contribution=random.randint(100, 5000),
                        target_date=(datetime.utcnow() + timedelta(days=random.randint(365, 3650))).strftime("%Y-%m-%d"),
                        status="active",
                        created_at=datetime.utcnow()
                    )
                    db.add(goal)
                print(f"Created goals for {user.name}")
        
        # 3. Create Investments
        symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "VTI", "SPY", "BND"]
        for user in created_users:
            if db.query(Investment).filter(Investment.user_id == user.id).count() == 0:
                num_investments = random.randint(2, 5)
                for _ in range(num_investments):
                    symbol = random.choice(symbols)
                    units = random.uniform(1, 100)
                    price = random.uniform(50, 500)
                    inv = Investment(
                        id=str(uuid.uuid4()),
                        user_id=user.id,
                        symbol=symbol,
                        asset_type="stock",
                        units=units,
                        avg_buy_price=price,
                        cost_basis=units * price,
                        current_value=units * price * random.uniform(0.9, 1.2),
                        last_price=price * random.uniform(0.9, 1.2),
                        last_price_at=datetime.utcnow(),
                        created_at=datetime.utcnow() - timedelta(days=random.randint(1, 700))
                    )
                    db.add(inv)
                print(f"Created investments for {user.name}")

        db.commit()
        print("Database seeding completed successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
