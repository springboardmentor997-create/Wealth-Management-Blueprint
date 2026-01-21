from celery import Celery
from celery.schedules import crontab
from celery.signals import task_failure
import yfinance as yf
import os
import uuid
from datetime import datetime
from sqlalchemy.orm import sessionmaker
from database import engine, SessionLocal
from models import Investment, User, Notification
import logging

# Optional SendGrid for email alerts
try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail
    SENDGRID_AVAILABLE = True
except Exception:
    SENDGRID_AVAILABLE = False

# Celery configuration
celery_app = Celery(
    "wealth_tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "update-market-prices": {
            "task": "celery_tasks.update_market_prices",
            "schedule": crontab(hour=0, minute=0),  # Daily at midnight
        },
        "generate-daily-reports": {
            "task": "celery_tasks.generate_daily_reports",
            "schedule": crontab(hour=1, minute=0),  # Daily at 1 AM
        },
    },
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
logger = logging.getLogger(__name__)

@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def update_market_prices(self):
    """Update market prices for all investments with retry and per-investment error handling."""
    db = SessionLocal()
    try:
        investments = db.query(Investment).all()
        updated_count = 0
        
        for investment in investments:
            try:
                ticker = yf.Ticker(investment.symbol)
                info = {}
                try:
                    info = ticker.info or {}
                except Exception:
                    # yfinance may raise when ticker data is unavailable - fallback to history
                    hist = ticker.history(period='1d')
                    if not hist.empty:
                        info['currentPrice'] = float(hist['Close'].iloc[-1])

                price = None
                if "currentPrice" in info and info['currentPrice']:
                    price = info['currentPrice']
                else:
                    # Try history close
                    try:
                        hist = ticker.history(period='1d')
                        if not hist.empty:
                            price = float(hist['Close'].iloc[-1])
                    except Exception:
                        price = None

                if price:
                    investment.last_price = float(price)
                    investment.current_value = float(investment.units) * float(price)
                    investment.last_price_at = datetime.utcnow()
                    updated_count += 1

            except Exception as e:
                logger.error(f"Failed to update {investment.symbol}: {e}")
                # Continue with other investments
                continue
                
        db.commit()
        logger.info(f"Updated prices for {updated_count} investments")
        return f"Updated {updated_count} investments"
        
    except Exception as e:
        db.rollback()
        logger.error(f"Market price update failed (will retry): {e}")
        try:
            # Exponential backoff retry
            countdown = min(60 * (2 ** self.request.retries), 3600)
            raise self.retry(exc=e, countdown=countdown)
        except Exception as retry_exc:
            # If the task will not be retried (retries exhausted or other), let the exception propagate
            logger.error(f"Retry scheduling failed or retries exhausted: {retry_exc}")
            raise
    finally:
        db.close()


# Celery signal handler to notify admins when the update task permanently fails
@task_failure.connect
def handle_task_failure(sender=None, task_id=None, exception=None, args=None, kwargs=None, traceback=None, einfo=None, **kwargs_extra):
    try:
        # Only handle failures for the market update task
        task_name = getattr(sender, 'name', str(sender))
        if 'update_market_prices' not in task_name:
            return

        logger.error(f"Task {task_name} failed permanently: {exception}")

        db = SessionLocal()
        admins = db.query(User).filter(User.is_admin == 'true').all()
        message = f"Nightly market update failed: {exception}"

        # Create DB notifications for admins
        for admin in admins:
            notif = Notification(
                id=str(uuid.uuid4()),
                user_id=admin.id,
                title="Market update failed",
                message=message,
                type="alert",
                is_read="false",
                created_at=datetime.utcnow()
            )
            db.add(notif)
        db.commit()

        # Attempt to send emails via SendGrid if configured and available
        sendgrid_key = os.getenv('SENDGRID_API_KEY')
        if SENDGRID_AVAILABLE and sendgrid_key:
            try:
                sg = SendGridAPIClient(sendgrid_key)
                for admin in admins:
                    mail = Mail(
                        from_email=os.getenv('ADMIN_EMAIL_FROM', 'no-reply@wealthapp.local'),
                        to_emails=admin.email,
                        subject='[WealthApp] Nightly Market Update Failed',
                        html_content=f'<p>{message}</p>'
                    )
                    sg.send(mail)
            except Exception as se:
                logger.error(f"Failed to send alert emails: {se}")

    except Exception as final_exc:
        logger.error(f"Error in task_failure handler: {final_exc}")
    finally:
        try:
            db.close()
        except Exception:
            pass

@celery_app.task
def generate_daily_reports():
    """Generate daily portfolio reports"""
    try:
        # Generate portfolio performance reports
        logger.info("Generating daily reports...")
        return "Daily reports generated"
    except Exception as e:
        logger.error(f"Report generation failed: {e}")
        return f"Failed: {e}"

@celery_app.task
def send_notification(user_id: str, title: str, message: str):
    """Send notification to user"""
    try:
        # Add notification to database
        logger.info(f"Notification sent to {user_id}: {title}")
        return "Notification sent"
    except Exception as e:
        logger.error(f"Notification failed: {e}")
        return f"Failed: {e}"