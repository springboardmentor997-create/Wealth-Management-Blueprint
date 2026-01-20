# Update Google Cloud Console for Authorization Code Flow

Your app now uses the **secure OAuth 2.0 Authorization Code Flow**. You need to update your Google Cloud Console settings.

## What Changed

**Old (Implicit/Token Flow):**
- Frontend got Google access token directly
- Not fully secure for web apps

**New (Authorization Code Flow):**
- Frontend gets authorization code only
- Backend exchanges code for tokens using Client Secret
- ✅ More secure and recommended

## Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your **OAuth 2.0 Client ID** (Web application)
4. Click the edit button (pencil icon)

### Update Redirect URIs

Find the section "Authorized redirect URIs" and add:

```
http://localhost:5173/login
http://localhost:3000/login
```

(Add your actual login URL - the example shows localhost for development)

### For Production

Add your production redirect URI:
```
https://yourdomain.com/login
```

5. Click **Save**

## Code Exchange Configuration

Your backend now uses:
- **Redirect URI:** `http://localhost:5173/login` (matches Google Cloud Console)
- **Client ID & Secret:** Securely stored in backend `.env`
- **Token Exchange:** Happens server-to-server (never exposed to frontend)

## Environment Variables

Make sure your `.env` file has both:

```env
GOOGLE_CLIENT_ID=625930519912-cchd9t2bqson1omf1nh4phthdd81be7t.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_SECRET_HERE
```

## How the New Flow Works

1. User clicks "Continue with Google"
2. Google OAuth popup opens (user signs in)
3. Google returns **authorization code** to frontend
4. Frontend sends code to backend `/auth/google-callback`
5. Backend exchanges code for ID token using Client Secret
6. Backend verifies token and creates/gets user
7. Backend returns JWT token to frontend
8. Frontend redirects to dashboard

## Benefits

✅ Client Secret never exposed to frontend  
✅ Authorization code used only once  
✅ More secure than implicit flow  
✅ Follows OAuth 2.0 best practices  
✅ Works with strict Content Security Policy  

## Testing

1. Restart backend and frontend
2. Go to `http://localhost:5173/login`
3. Click "Continue with Google"
4. Should redirect to dashboard after sign-in

If you see errors, check:
- GOOGLE_CLIENT_SECRET is set in `.env`
- Redirect URI matches in Google Cloud Console
- Both servers are running
