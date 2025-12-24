# Kocha 360° Architecture

## System Overview

**Product Name:** Kocha 360°  
**Core Promise:** "The Operating System for the Multi-Hyphenate Leader."  
**Key Differentiator:** Identity Switching + AI Chief of Staff

## Technology Stack

### Frontend
- **React 19** with Vite
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Firebase SDK** for authentication and database

### Backend
- **Firebase Authentication** (Google, Apple, Microsoft, Email)
- **Cloud Firestore** (NoSQL database)
- **Firebase Cloud Functions** (Future: AI integration, calendar sync)

### Integrations
- **Google Calendar** (via Firebase OAuth)
- **Microsoft Outlook** (via Microsoft Graph API)
- **Apple Calendar** (via iCal subscription URL)

## Core Concepts

### 1. Identity Switching
Users have multiple roles/identities (e.g., "Founder", "Parent", "Athlete"). The app adapts based on the current context.

### 2. Dynamic Onboarding
No hardcoded values. User profile is stored in Firestore with:
- Identities (roles)
- Habits (daily non-negotiables)
- North Star goal
- Weekly themes

### 3. Unified Calendar View
Aggregates events from multiple calendars (Family, Work, Personal) into one "Heads Up Display."

### 4. AI Chief of Staff
Floating chat interface that:
- Reads current mode/context
- Provides intelligent assistance
- Helps prioritize tasks
- Suggests actions

## Data Model

### User Profile (`users/{userId}`)

```javascript
{
  displayName: string,
  northStar: {
    label: string,
    target: number,
    current: number
  },
  identities: [
    {
      id: string,
      name: string,
      color: "blue" | "purple" | "green"
    }
  ],
  habits: [
    {
      id: string,
      label: string,
      icon: string,
      completed: boolean
    }
  ],
  weeklyThemes: {
    0: string, // Sunday
    1: string, // Monday
    ...
  }
}
```

## Implementation Phases

### Phase 1: The "Shell" ✅
- Frontend UI with mock connections
- Dynamic onboarding wizard
- Firebase authentication
- Firestore data storage
- Basic dashboard

### Phase 2: The "Wiring" (Next)
- Real calendar integrations
- Calendar aggregation
- Event conflict detection
- Settings panel for calendar connections

### Phase 3: The "Intelligence"
- Connect chat UI to OpenAI/Gemini
- Context-aware AI responses
- Proactive suggestions
- Calendar optimization

## Calendar Integration Strategy

### Google Calendar
- Direct integration via Firebase OAuth
- Scope: `calendar.readonly`
- Real-time sync via Google Calendar API

### Microsoft Outlook
- Integration via Microsoft Graph API
- OAuth flow through Firebase
- Scope: `Calendars.Read`

### Apple Calendar (iCloud)
- **Challenge:** Hardest to integrate
- **Solution:** iCal subscription URL method
  1. User generates subscription URL on iPhone
  2. Pastes URL into Kocha settings
  3. App fetches events via iCal feed

## AI Model Strategy

### Router Architecture
The AI acts as a "router" that:
1. Reads current context (mode, tasks, calendar)
2. Determines user intent
3. Routes to appropriate handler:
   - Task management
   - Calendar optimization
   - Goal tracking
   - Habit building

### Example Interaction

**User:** "I'm overwhelmed."

**Kocha AI:**
1. Reads current mode (e.g., "CEO")
2. Checks calendar (4 meetings today)
3. Analyzes tasks
4. Responds: "I see you have 4 meetings. Which one can we cancel?"

## File Structure

```
src/
  App.jsx              # Main app component (Firebase integrated)
  main.jsx             # Entry point
  index.css            # Global styles
  
  components/          # Old components (legacy, not used)
  context/             # Old context (legacy, not used)
  services/            # Old services (legacy, not used)
```

## Environment Variables

Create `.env` file:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Firebase:**
   - See `FIREBASE_SETUP.md`

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Add your Firebase config
   ```

4. **Run dev server:**
   ```bash
   npm run dev
   ```

5. **Test:**
   - Try "Demo Mode" (no Firebase needed)
   - Or set up Firebase and test real auth

## Migration Notes

The app has been completely rebuilt with:
- ✅ Firebase instead of FastAPI backend
- ✅ Self-contained App.jsx (no AppContext)
- ✅ Dynamic onboarding wizard
- ✅ Firestore data model
- ✅ Identity-based UI

Old components in `src/components/` and `src/context/` are legacy and not used by the new architecture.

