# Calendar Integration Setup Guide

## Prerequisites

1. **Backend server must be running**
   ```bash
   cd backend
   python -m app.main
   # Or: uvicorn app.main:app --reload --port 8000
   ```

2. **Environment variables must be configured**

## Google Calendar Setup

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Calendar API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:8000/api/calendar/google/callback`
     - `http://localhost:5173/calendar/callback` (or your frontend URL)
   - Copy the **Client ID** and **Client Secret**

### Step 2: Configure Backend

Add to `backend/.env`:
```bash
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### Step 3: Restart Backend

Restart the backend server for changes to take effect.

## Microsoft 365/Outlook Setup

### Step 1: Register Application in Azure

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Fill in:
   - **Name**: Kocha 360° Calendar
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**: 
     - Type: Web
     - URI: `http://localhost:8000/api/calendar/microsoft/callback`
5. Click "Register"
6. Copy the **Application (client) ID**

### Step 2: Create Client Secret

1. In your app registration, go to "Certificates & secrets"
2. Click "New client secret"
3. Add description and expiration
4. Copy the **Value** (this is your client secret - save it immediately!)

### Step 3: Configure API Permissions

1. Go to "API permissions"
2. Click "Add a permission"
3. Select "Microsoft Graph"
4. Choose "Delegated permissions"
5. Add:
   - `Calendars.Read`
   - `Calendars.ReadWrite` (optional, for write access)
6. Click "Add permissions"
7. Click "Grant admin consent" (if you have admin rights)

### Step 4: Configure Backend

Add to `backend/.env`:
```bash
MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here
```

### Step 5: Restart Backend

Restart the backend server for changes to take effect.

## Apple Calendar Setup (CalDAV)

Apple Calendar uses CalDAV protocol, which requires:

1. **iCloud CalDAV Server**: `https://caldav.icloud.com`
2. **App-Specific Password**:
   - Go to [appleid.apple.com](https://appleid.apple.com)
   - Sign in and go to "Security"
   - Generate an app-specific password
   - Use this password (not your regular Apple ID password)

3. **Username**: Your Apple ID email

## Testing the Integration

1. **Check backend health**:
   ```bash
   curl http://localhost:8000/health
   ```

2. **Test Google Calendar**:
   - Click "Connect Google Calendar" in the app
   - You should be redirected to Google OAuth consent screen
   - After authorization, you'll be redirected back

3. **Test Microsoft Calendar**:
   - Click "Connect Outlook Calendar" in the app
   - You should be redirected to Microsoft OAuth consent screen
   - After authorization, you'll be redirected back

## Troubleshooting

### "Backend server is not running"
- Start the backend: `cd backend && python -m app.main`
- Check if it's running on port 8000: `curl http://localhost:8000/health`

### "OAuth credentials not configured"
- Check that `.env` file exists in `backend/` directory
- Verify environment variables are set correctly
- Restart the backend server after changing `.env`

### "Load failed" or Network errors
- Check CORS settings in `backend/app/main.py`
- Ensure frontend URL is in allowed origins
- Check browser console for detailed error messages

### OAuth redirect errors
- Verify redirect URIs match exactly in:
  - Google Cloud Console / Azure Portal
  - Your application code
- Check that redirect URI includes protocol (http:// or https://)

## Production Deployment

For production:

1. Use HTTPS for all redirect URIs
2. Store credentials securely (use environment variables, not hardcoded)
3. Update redirect URIs in OAuth providers to match production URLs
4. Consider using a secrets management service (AWS Secrets Manager, Azure Key Vault, etc.)

