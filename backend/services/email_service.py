"""
Email service for sending password reset emails
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from core.config import settings
import logging

logger = logging.getLogger(__name__)


def send_password_reset_email(email: str, reset_token: str, user_name: str = "User"):
    """
    Send password reset email to user
    
    Args:
        email: User's email address
        reset_token: Password reset token
        user_name: User's name for personalization
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Check if email is configured
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.warning("Email not configured - skipping email send")
            logger.warning(f"Reset token for {email}: {reset_token}")
            return False

        # Create email
        subject = "Password Reset Request - Wealth Manager"
        
        # HTML email body
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1e40af;">Password Reset Request</h2>
                    
                    <p>Hi {user_name},</p>
                    
                    <p>We received a request to reset your password. Click the link below or use the code to reset your password:</p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; color: #666; font-size: 14px;">Your Reset Code:</p>
                        <p style="margin: 10px 0; font-family: monospace; font-size: 16px; font-weight: bold; color: #1e40af;">
                            {reset_token}
                        </p>
                    </div>
                    
                    <p><strong>How to reset your password:</strong></p>
                    <ol>
                        <li>Go to the Wealth Manager login page</li>
                        <li>Click "Forgot Password?"</li>
                        <li>Enter your email and the code above</li>
                        <li>Create a new password</li>
                    </ol>
                    
                    <p style="color: #666; font-size: 14px;">
                        <strong>Note:</strong> This link expires in 24 hours. If you didn't request this, please ignore this email.
                    </p>
                    
                    <p style="margin-top: 30px; color: #999; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                        © 2026 Wealth Manager. All rights reserved.
                    </p>
                </div>
            </body>
        </html>
        """
        
        # Plain text fallback
        text_body = f"""
Password Reset Request - Wealth Manager

Hi {user_name},

We received a request to reset your password. Use the code below:

Reset Code: {reset_token}

This code expires in 24 hours.

How to reset:
1. Go to the login page
2. Click "Forgot Password?"
3. Enter your email and the code above
4. Create a new password

If you didn't request this, please ignore this email.

© 2026 Wealth Manager
        """
        
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.SENDER_NAME} <{settings.SENDER_EMAIL}>"
        msg["To"] = email
        
        # Attach both text and HTML
        msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))
        
        # Send email via SMTP
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Password reset email sent to {email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {email}: {str(e)}")
        # In development, still log the token
        logger.warning(f"Reset token for {email}: {reset_token}")
        return False
