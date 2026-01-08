from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Goal, User

# Connect to database (assuming PostgreSQL based on previous context)
# I need the database URL. I'll check database.py first to be sure how to connect.
# But for now I'll assume I can read it from .env or just search for it.
# Wait, I can just use the app's internal logic.

from database import SessionLocal

def list_all_goals():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Total Users: {len(users)}")
        for user in users:
            print(f"User: {user.email} (ID: {user.id})")
            goals = db.query(Goal).filter(Goal.user_id == user.id).all()
            print(f"  Goals: {len(goals)}")
            for goal in goals:
                print(f"    - {goal.title} (ID: {goal.id})")
    finally:
        db.close()

if __name__ == "__main__":
    list_all_goals()
