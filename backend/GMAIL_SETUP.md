# Gmail Setup Guide for Password Reset Emails

## Step 1: Enable 2-Factor Authentication (Required for App Passwords)

1. Go to **https://myaccount.google.com/security**
2. Scroll down to "How you sign in to Google"
3. Click **"2-Step Verification"**
4. Follow the prompts to add a phone number
5. Verify with a code sent to your phone
6. Click **"Turn On"**

## Step 2: Create Gmail App Password

1. Go to **https://myaccount.google.com/apppasswords**
   - (You must be signed in and have 2FA enabled)
2. Select **App:** "Mail"
3. Select **Device:** "Windows Computer"
4. Click **"Generate"**
5. Google will show you a **16-character password**
   - Example: `abcd efgh ijkl mnop` (with spaces)
   - Copy this without spaces: `abcdefghijklmnop`

## Step 3: Update `.env` File

Open `backend/.env` and find these lines:

```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SENDER_EMAIL=your_email@gmail.com
SENDER_NAME=Wealth Manager
```

Replace:
- `your_email@gmail.com` → Your actual Gmail address (both places)
- `your_app_password` → The 16-character password from Step 2

**Example:**
```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=john.doe@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
SENDER_EMAIL=john.doe@gmail.com
SENDER_NAME=Wealth Manager
```

## Step 4: Test Email Sending

Run the test:
```bash
cd backend
python test_forgot_password_email.py
```

You should see:
```
[OK] Email configured for: your_email@gmail.com
     Sender: Wealth Manager <your_email@gmail.com>
...
[OK] Email sent to emailtest@example.com
     Check your inbox for the password reset code
```

## Step 5: Test in the App

1. Start backend: `uvicorn main:app --port 8000`
2. Start frontend: `npm run dev` (in frontend folder)
3. Go to http://localhost:5173
4. Click **Login** → **Forgot Password?**
5. Enter your email → **Send Reset Link**
6. Check your email inbox for the reset code
7. Enter code + new password → **Reset Password**
8. Login with new password

## Troubleshooting

### Error: "Username and Password not accepted"
- Make sure you used the **16-character app password**, not your Gmail password
- Verify spaces were removed from the app password
- Check 2-Factor Authentication is still enabled
- Create a new app password and try again

### Error: "SMTP connection refused"
- Check internet connection
- Verify `SMTP_SERVER=smtp.gmail.com` and `SMTP_PORT=587`
- Try changing port to 465 (SSL) instead of 587 (TLS)

### Email not arriving
- Check spam/junk folder
- Wait a few seconds (sometimes delayed)
- Check backend logs for errors: `python test_forgot_password_email.py`

## Security Notes

⚠️ **Never commit `.env` to git!**

1. Make sure `.gitignore` contains `.env`:
   ```
   .env
   .env.local
   *.pyc
   __pycache__/
   ```

2. App passwords are safer than your main Gmail password
   - They only work for this app
   - You can delete them anytime
   - Your Gmail account stays secure

## What Happens With Emails

Users who request a password reset will receive:
- **HTML email** with formatting and instructions
- **Plain text fallback** if HTML doesn't display
- **Reset code** they need to enter
- **24-hour expiration** warning
- Link back to reset page

✅ That's it! Your password reset emails are now live!
