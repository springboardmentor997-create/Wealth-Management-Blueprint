from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from database import get_db
from models import Notification, User, Goal, Investment
from schemas import Notification as NotificationSchema
from auth import get_current_user
from datetime import datetime, timedelta
import uuid
import random

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

@router.get("/", response_model=List[NotificationSchema])
def get_notifications(
    skip: int = 0, 
    limit: int = 20, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check and generate system notifications based on user data
    check_and_generate_notifications(db, current_user)
    
    notifications = db.query(Notification)\
        .filter(Notification.user_id == current_user.id)\
        .order_by(desc(Notification.created_at))\
        .offset(skip)\
        .limit(limit)\
        .all()
    return notifications

@router.put("/{notification_id}/read", response_model=NotificationSchema)
def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notification.is_read = "true"
    db.commit()
    db.refresh(notification)
    return notification

def create_notification(db: Session, user_id: str, title: str, message: str, type: str = "info"):
    notif = Notification(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title=title,
        message=message,
        type=type,
        is_read="false",
        created_at=datetime.utcnow()
    )
    db.add(notif)
    db.commit()

def check_and_generate_notifications(db: Session, user: User):
    # 1. Check Goal Progress
    goals = db.query(Goal).filter(Goal.user_id == user.id).all()
    for goal in goals:
        if goal.target_amount > 0:
            progress = (goal.current_amount / goal.target_amount) * 100
            
            # Milestone: 50%
            if progress >= 50 and progress < 100:
                title = "Goal Milestone Reached!"
                msg = f"You've reached {int(progress)}% of your '{goal.title}' goal. Keep it up!"
                # Check duplication
                exists = db.query(Notification).filter(
                    Notification.user_id == user.id, 
                    Notification.message == msg
                ).first()
                if not exists:
                    create_notification(db, user.id, title, msg, "goal")
            
            # Milestone: 100%
            elif progress >= 100:
                title = "Goal Achieved!"
                msg = f"Congratulations! You've achieved your '{goal.title}' goal."
                exists = db.query(Notification).filter(
                    Notification.user_id == user.id, 
                    Notification.message == msg
                ).first()
                if not exists:
                    create_notification(db, user.id, title, msg, "goal")
            
            # Reminder: If deadline is approaching (within 30 days) and goal < 90%
            if goal.target_date:
                try:
                    target = datetime.strptime(goal.target_date, "%Y-%m-%d") # Assuming ISO format
                    days_left = (target - datetime.utcnow()).days
                    if 0 < days_left <= 30 and progress < 90:
                        title = "Goal Deadline Approaching"
                        msg = f"Your goal '{goal.title}' is due in {days_left} days. You are at {int(progress)}%."
                        # Prevent daily spam - allow one per week maybe? Or just check if exists
                        exists = db.query(Notification).filter(
                            Notification.user_id == user.id,
                            Notification.title == title,
                            Notification.message == msg
                        ).first()
                        if not exists:
                            create_notification(db, user.id, title, msg, "alert")
                except ValueError:
                    pass # Date parsing error

    # 2. Check KYC Status - and Cleanup if verified
    if user.kyc_status == "verified":
         # Auto-resolve KYC notifications if user is now verified
        kyc_notifs = db.query(Notification).filter(
            Notification.user_id == user.id,
            Notification.title == "Complete your KYC",
            Notification.is_read == "false"
        ).all()
        for n in kyc_notifs:
            n.is_read = "true"
        if kyc_notifs:
            db.commit()

    elif user.kyc_status != "verified":
        title = "Complete your KYC"
        msg = "Your account is not fully verified. Complete KYC to unlock all features."
        exists = db.query(Notification).filter(
            Notification.user_id == user.id, 
            Notification.title == title
        ).first()
        if not exists:
            create_notification(db, user.id, title, msg, "system")
            
    # 3. Portfolio Update (Simulated daily)
    investments = db.query(Investment).filter(Investment.user_id == user.id).all()
    if investments:
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        recent_update = db.query(Notification).filter(
            Notification.user_id == user.id,
            Notification.title == "Portfolio Update",
            Notification.created_at >= today_start
        ).first()
        
        if not recent_update:
            total_value = sum(inv.current_value or 0 for inv in investments)
            # Simulated movement
            move = round(random.uniform(-2.0, 2.0), 2)
            sign = "+" if move >= 0 else ""
            msg = f"Your portfolio value is ${total_value:,.2f}. Market movement today: {sign}{move}%"
            create_notification(db, user.id, "Portfolio Update", msg, "portfolio")
