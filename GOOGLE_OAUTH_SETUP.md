# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the Wealth Manager application.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a Project** → **New Project**
3. Enter project name: `Wealth Manager` and click **Create**
4. Wait for the project to be created (1-2 minutes)

## Step 2: Enable Google+ API

1. In the Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and press **Enable**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted: Configure OAuth consent screen first:
   - Click **Configure Consent Screen**
   - Choose **External** user type
   - Fill in:
     - App name: `Wealth Manager`
     - User support email: your-email@gmail.com
     - Developer contact: your-email@gmail.com
   - Click **Save and Continue** through the scopes section
   - Click **Save and Continue** on the summary

4. Back to creating OAuth credentials:
   - Application type: **Web application**
   - Name: `Wealth Manager Web`
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - `http://localhost:3000` (if using different port)
   - Authorized redirect URIs:
     - `http://localhost:5173/login` (or your app login URL)
   - Click **Create**

5. Copy your **Client ID** from the popup

## Step 4: Configure Your Application

### Backend (.env file)

```env
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
```

Replace `YOUR_CLIENT_ID_HERE` with the Client ID you copied from Google Cloud Console.

### Frontend (.env.local file)

```env
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
```

Replace with the same Client ID.

## Step 5: Test Google Login

1. Start the backend:
```bash
cd backend
python -m uvicorn main:app --port 8000
```

2. Start the frontend (in another terminal):
```bash
cd frontend
npm run dev
```

3. Navigate to `http://localhost:5173/login`
4. Click **Continue with Google** button
5. Sign in with your Google account
6. You should be redirected to the dashboard

## Troubleshooting

### "Invalid Client ID" Error
- Verify you copied the correct Client ID from Google Cloud Console
- Check that it's the same in both `.env` (backend) and `.env.local` (frontend)
- Restart both backend and frontend servers after changing the ID

### "Redirect URI Mismatch"
- Check that `http://localhost:5173` is in your Authorized JavaScript origins in Google Cloud Console
- If using a different port, add that port number too

### "OAuth consent screen not configured"
- You must configure the OAuth consent screen before creating credentials
- Go to **APIs & Services** → **OAuth consent screen** and follow the steps

### Token Verification Fails
- Ensure GOOGLE_CLIENT_ID in backend config.py matches the one in Google Cloud Console
- The token must be verified on the backend before creating a JWT

## For Production Deployment

Before deploying to production:

1. Update Google Cloud Console:
   - Add your production domain to Authorized JavaScript origins
   - Example: `https://yourapp.com`
   - Add production redirect URI: `https://yourapp.com/login`

2. Update environment variables:
   - Set GOOGLE_CLIENT_ID in your production environment

3. Update frontend .env:
   - Set VITE_GOOGLE_CLIENT_ID for production build

## How It Works

1. User clicks "Continue with Google"
2. Google OAuth popup opens (user signs in with their Google account)
3. Frontend receives Google access token
4. Frontend sends token to backend `/auth/google-login` endpoint
5. Backend verifies token with Google's servers
6. If valid:
   - Existing user: Login successful
   - New user: Account created automatically
7. Backend returns JWT token to frontend
8. Frontend stores JWT and redirects to dashboard

## Security Notes

- The Google Client Secret is NOT included in frontend code
- Only the Client ID is used frontend (it's public)
- Token verification happens on the backend using Google's official libraries
- New users created via Google get a random password (they can set one if needed)
- All authentication follows OAuth 2.0 security best practices
