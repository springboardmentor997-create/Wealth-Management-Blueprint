from sqlalchemy.orm import Session
from database import SessionLocal
from models import Goal, User
import uuid
from datetime import datetime, timedelta

def add_sample_goals():
    db = SessionLocal()
    try:
        # Find the user
        user = db.query(User).filter(User.email == "bluestock123@gmail.com").first()
        if not user:
            print("User bluestock123@gmail.com not found. Please register/login first.")
            return

        print(f"Adding sample goals for {user.email}...")

        goals = [
            {
                "title": "Retirement Fund",
                "goal_type": "retirement",
                "target_amount": 1000000,
                "current_amount": 50000,
                "target_date": (datetime.now() + timedelta(days=365*20)).strftime("%Y-%m-%d"),
                "monthly_contribution": 1000
            },
            {
                "title": "Dream Home",
                "goal_type": "home",
                "target_amount": 500000,
                "current_amount": 25000,
                "target_date": (datetime.now() + timedelta(days=365*5)).strftime("%Y-%m-%d"),
                "monthly_contribution": 2000
            },
            {
                "title": "Tesla Cybercab",
                "goal_type": "custom",
                "target_amount": 60000,
                "current_amount": 5000,
                "target_date": (datetime.now() + timedelta(days=365*2)).strftime("%Y-%m-%d"),
                "monthly_contribution": 800
            }
        ]

        for goal_data in goals:
            existing_goal = db.query(Goal).filter(
                Goal.user_id == user.id, 
                Goal.title == goal_data["title"]
            ).first()
            
            if not existing_goal:
                new_goal = Goal(
                    id=str(uuid.uuid4()),
                    user_id=user.id,
                    status="active",
                    **goal_data
                )
                db.add(new_goal)
                print(f"Created goal: {goal_data['title']}")
            else:
                print(f"Goal already exists: {goal_data['title']}")

        db.commit()
        print("Done! Refresh the page.")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_goals()
