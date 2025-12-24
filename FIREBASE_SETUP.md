# Firebase Setup Guide for Kocha 360°

## Overview

Kocha 360° uses Firebase for:
- **Authentication** (Google, Apple, Microsoft, Email)
- **Firestore Database** (User profiles, habits, goals)
- **Cloud Functions** (Future: AI integration, calendar sync)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `kocha-360` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Register Web App

1. In Firebase Console, click the Web icon (`</>`)
2. Register app nickname: `Kocha 360 Web`
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. Copy the Firebase configuration object

## Step 3: Configure Authentication

### Enable Sign-in Methods

1. Go to **Authentication** > **Sign-in method**
2. Enable the following providers:
   - **Email/Password**: Enable
   - **Google**: Enable, add support email
   - **Apple**: Enable (requires Apple Developer account)
   - **Microsoft**: Enable (requires Azure app registration)

### Google Sign-in Setup

1. In Google Sign-in settings, add your domain to authorized domains
2. Add authorized redirect URIs:
   - `http://localhost:5173` (development)
   - Your production domain

### Microsoft Sign-in Setup

1. Register app in [Azure Portal](https://portal.azure.com/)
2. Add redirect URI: `https://YOUR_PROJECT_ID.firebaseapp.com/__/auth/handler`
3. Copy Client ID and Secret to Firebase

## Step 4: Set Up Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Start in **test mode** (for development)
4. Choose location (closest to your users)
5. Click "Enable"

### Security Rules (Development)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Security Rules (Production)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Add more rules as needed for other collections
  }
}
```

## Step 5: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Firebase config to `.env`:
   ```bash
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=kocha-360.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=kocha-360
   VITE_FIREBASE_STORAGE_BUCKET=kocha-360.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

## Step 6: Install Dependencies

Firebase is already in `package.json`. Just install:

```bash
npm install
```

## Step 7: Test the Setup

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Try "Demo Mode" first (no Firebase needed)
3. Then try Google Sign-in (requires Firebase config)

## Data Structure

### User Profile Document

Location: `users/{userId}`

```javascript
{
  displayName: "John Doe",
  northStar: {
    label: "2026 Revenue Goal",
    target: 1000000,
    current: 150000
  },
  identities: [
    { id: "role_1", name: "The Founder", color: "blue" },
    { id: "role_2", name: "The Athlete", color: "green" }
  ],
  habits: [
    { id: "h1", label: "Deep Work (2h)", icon: "briefcase", completed: false },
    { id: "h2", label: "Run 5k", icon: "heart", completed: false }
  ],
  weeklyThemes: {
    0: "Rest & Review",  // Sunday
    1: "Execution",       // Monday
    2: "Deep Work",      // Tuesday
    3: "Meetings",       // Wednesday
    4: "Admin",          // Thursday
    5: "Family",         // Friday
    6: "Planning"        // Saturday
  }
}
```

## Phase 2: Calendar Integration

### Google Calendar

1. Enable Google Calendar API in [Google Cloud Console](https://console.cloud.google.com/)
2. Add OAuth scopes to Firebase:
   - `https://www.googleapis.com/auth/calendar.readonly`
3. Request calendar access in app

### Microsoft Outlook

1. Register app in Azure Portal
2. Add Microsoft Graph API permissions:
   - `Calendars.Read`
3. Configure in Firebase Authentication

### Apple Calendar (iCloud)

Use iCal subscription URL method:
1. User generates subscription URL on iPhone
2. Paste URL into Kocha settings
3. App fetches events via iCal feed

## Phase 3: AI Integration

Future: Use Firebase Cloud Functions to:
- Connect to OpenAI/Gemini APIs
- Process user queries
- Generate recommendations
- Sync calendar events

## Troubleshooting

### "Firebase keys not detected"
- Check `.env` file exists
- Verify all environment variables are set
- Restart dev server after changing `.env`

### "Permission denied" in Firestore
- Check Firestore security rules
- Verify user is authenticated
- Check user ID matches document ID

### Authentication errors
- Verify sign-in methods are enabled in Firebase Console
- Check authorized domains/redirect URIs
- Review browser console for specific errors

## Production Deployment

1. Update security rules for production
2. Set up custom domain in Firebase Hosting
3. Update authorized domains in Authentication
4. Enable billing if using paid features
5. Set up monitoring and alerts

