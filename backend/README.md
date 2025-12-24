# Strategy Backend - AI-Powered Life Organizer

Python backend with FastAPI, Machine Learning, and AI capabilities.

## Features

- **FastAPI** REST API
- **SQLAlchemy** database ORM
- **Machine Learning** models for behavior analysis
- **AI-powered** recommendations and coaching
- **Behavioral Science** principles for habit building

## Setup

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your settings
```

3. Initialize database:
```bash
python -c "from app.models.database import init_db; init_db()"
```

4. Run the server:
```bash
python -m app.main
# Or with uvicorn:
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/{user_id}` - Get user
- `PUT /api/users/{user_id}/profile` - Update profile

### Habits
- `POST /api/habits/` - Create habit
- `POST /api/habits/batch-update` - Update multiple habits
- `GET /api/habits/history` - Get habit history

### Goals
- `POST /api/goals/` - Create goal
- `GET /api/goals/` - Get user goals
- `PUT /api/goals/{goal_id}` - Update goal
- `DELETE /api/goals/{goal_id}` - Delete goal

### Analytics
- `POST /api/analytics/metrics` - Save metrics
- `GET /api/analytics/insights` - Get insights

### AI Recommendations
- `POST /api/ai/recommendations` - Get personalized recommendations
- `POST /api/ai/analyze` - Analyze behavior
- `POST /api/ai/coaching` - Get coaching advice

### Life Coaching
- `POST /api/coaching/plan` - Get coaching plan

## ML Models

- **BehaviorAnalyzer**: Analyzes productivity patterns, habit strengths
- **HabitBuilder**: Builds and optimizes habits using behavioral science
- **StrategicPlanner**: Creates strategic life plans and coaching insights

## Development

The backend uses:
- FastAPI for the API
- SQLAlchemy for database
- scikit-learn for ML
- Custom ML models for behavior analysis

