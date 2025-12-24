# Backend Setup Guide

## Overview

The Strategy app now includes a Python backend with AI/ML capabilities for:
- Behavior analysis and pattern recognition
- Personalized recommendations
- Strategic life planning
- Habit building optimization
- Life coaching insights

## Architecture

### Backend Stack
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: Database ORM
- **scikit-learn**: Machine learning
- **NumPy/Pandas**: Data analysis
- **JWT**: Authentication

### ML Models
1. **BehaviorAnalyzer**: Analyzes productivity patterns, identifies peak hours, detects trends
2. **HabitBuilder**: Optimizes habits using behavioral science (Atomic Habits, Tiny Habits)
3. **StrategicPlanner**: Creates strategic life plans, analyzes life balance
4. **AIEngine**: Orchestrates ML models and generates recommendations

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Environment Variables

```bash
cp .env.example .env
# Edit .env:
# - SECRET_KEY: Generate a secure secret key
# - DATABASE_URL: SQLite (default) or PostgreSQL
# - OPENAI_API_KEY: Optional, for advanced AI features
```

### 3. Initialize Database

```bash
python -c "from app.models.database import init_db; init_db()"
```

### 4. Run Backend Server

```bash
# Development mode with auto-reload
python -m app.main

# Or with uvicorn directly
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### 5. Update Frontend

The frontend is already configured to connect to the backend. Make sure:

1. Create `.env` file in root:
```
VITE_API_URL=http://localhost:8000
```

2. The frontend will automatically use the backend API when available

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/{user_id}` - Get user profile
- `PUT /api/users/{user_id}/profile` - Update profile
- `POST /api/users/{user_id}/onboarding-complete` - Complete onboarding

### Habits
- `POST /api/habits/` - Create habit entry
- `POST /api/habits/batch-update` - Update multiple habits
- `GET /api/habits/history` - Get habit history

### Goals
- `POST /api/goals/` - Create goal
- `GET /api/goals/` - Get user goals
- `PUT /api/goals/{goal_id}` - Update goal
- `DELETE /api/goals/{goal_id}` - Delete goal

### Analytics
- `POST /api/analytics/metrics` - Save daily metrics
- `GET /api/analytics/insights` - Get AI-powered insights

### AI Recommendations
- `POST /api/ai/recommendations` - Get personalized recommendations
- `POST /api/ai/analyze` - Analyze behavior patterns
- `POST /api/ai/coaching` - Get coaching advice

### Life Coaching
- `POST /api/coaching/plan` - Get strategic coaching plan

## ML Features

### Behavior Analysis
- Identifies peak productivity hours
- Detects best days of the week
- Analyzes productivity trends
- Calculates habit completion rates

### Habit Building
- Suggests optimal habit timing
- Recommends habit chaining/stacking
- Generates personalized nudges
- Tracks habit stages (formation, consolidation, mastery)

### Strategic Planning
- Analyzes life balance across domains
- Identifies priority areas
- Creates action plans
- Generates milestones

### AI Recommendations
- Personalized schedules
- Habit optimization suggestions
- Strategic focus areas
- Behavioral nudges

## Development

### Running Both Frontend and Backend

Terminal 1 (Backend):
```bash
cd backend
python -m app.main
```

Terminal 2 (Frontend):
```bash
npm run dev
```

### Testing the API

Visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI)

### Database

By default, uses SQLite (`strategy.db`). For production, switch to PostgreSQL:

```env
DATABASE_URL=postgresql://user:password@localhost/strategy
```

## Production Deployment

1. Set secure `SECRET_KEY` in environment
2. Use PostgreSQL or another production database
3. Set up proper CORS origins
4. Use environment variables for all secrets
5. Consider adding rate limiting
6. Set up logging and monitoring

## Next Steps

- [ ] Add OpenAI integration for advanced AI features
- [ ] Implement real-time behavior pattern updates
- [ ] Add more sophisticated ML models
- [ ] Create habit templates library
- [ ] Add social features and comparisons
- [ ] Implement push notifications

