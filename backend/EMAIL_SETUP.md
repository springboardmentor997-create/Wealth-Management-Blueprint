# Email Configuration Guide

## How to Enable Password Reset Emails

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication on your Gmail account:**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Create an App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Google will generate a 16-character password
   - Copy this password

3. **Update `.env` file:**
   ```
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_app_password_here
   SENDER_EMAIL=your_email@gmail.com
   SENDER_NAME=Wealth Manager
   ```

4. **Test:** Run the forgot password test
   ```bash
   python test_forgot_password_email.py
   ```

### Option 2: Other Email Services

#### SendGrid
```env
SMTP_SERVER=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.your_sendgrid_api_key
SENDER_EMAIL=your_email@example.com
```

#### Outlook/Office 365
```env
SMTP_SERVER=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your_email@outlook.com
SMTP_PASSWORD=your_password
SENDER_EMAIL=your_email@outlook.com
```

### Testing

1. **With Email Configured:** Reset emails will be sent
2. **Without Email Configured:** Reset tokens will be logged to console for development

## Security Notes

- Reset tokens expire in **24 hours**
- Tokens are stored as hashed values in the database
- Never commit `.env` with real credentials to git
- Use app-specific passwords instead of your actual password

## Email Template

Users receive an HTML email with:
- Personalized greeting with their name
- The reset code they need to use
- Instructions on how to reset password
- Security note about token expiration
