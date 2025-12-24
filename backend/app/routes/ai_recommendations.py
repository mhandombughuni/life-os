"""
AI-powered recommendations routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db, User, Habit, Goal, Metric
from app.models.schemas import RecommendationRequest, RecommendationResponse
from app.services.ai_engine import AIEngine
from datetime import datetime, timedelta

router = APIRouter()
ai_engine = AIEngine()

def get_user_data(user_id: int, db: Session) -> dict:
    """Get all user data for AI analysis"""
    # Get habits (last 30 days)
    habits = db.query(Habit).filter(
        Habit.user_id == user_id,
        Habit.date >= (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    ).all()
    
    habit_history = []
    current_date = None
    current_habits = {}
    
    for habit in habits:
        if habit.date != current_date:
            if current_date:
                habit_history.append({"date": current_date, "habits": current_habits})
            current_date = habit.date
            current_habits = {}
        current_habits[habit.habit_key] = habit.completed
    
    if current_date:
        habit_history.append({"date": current_date, "habits": current_habits})
    
    # Get metrics
    metrics = db.query(Metric).filter(
        Metric.user_id == user_id,
        Metric.date >= (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    ).all()
    
    metrics_data = [{
        "date": m.date,
        "productivity_score": m.productivity_score,
        "habit_completion_rate": m.habit_completion_rate,
        "goal_progress_rate": m.goal_progress_rate,
        "timestamp": m.created_at.isoformat() if m.created_at else None
    } for m in metrics]
    
    # Get goals
    goals = db.query(Goal).filter(Goal.user_id == user_id).all()
    goals_data = [{
        "id": g.id,
        "name": g.name,
        "current_value": g.current_value,
        "target_value": g.target_value,
        "category": g.category
    } for g in goals]
    
    # Get user profile
    user = db.query(User).filter(User.id == user_id).first()
    profile = {
        "challenges": user.challenges if user else [],
        "goals": user.goals if user else [],
        "preferences": user.preferences if user else {}
    }
    
    return {
        "habits": habit_history,
        "metrics": metrics_data,
        "goals": goals_data,
        "profile": profile
    }

@router.post("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(
    request: RecommendationRequest,
    db: Session = Depends(get_db)
):
    """Get AI-powered personalized recommendations"""
    user_data = get_user_data(request.user_id, db)
    
    recommendations = ai_engine.generate_personalized_recommendations(user_data)
    
    return RecommendationResponse(
        recommendations=[
            {"type": "schedule", "data": recommendations["schedule"]},
            {"type": "habits", "data": recommendations["habits"]},
            {"type": "nudges", "data": recommendations["nudges"]},
            {"type": "strategic_plan", "data": recommendations["strategic_plan"]}
        ],
        reasoning="Based on your behavior patterns, habit strengths, and goals",
        confidence=0.85
    )

@router.post("/analyze")
async def analyze_behavior(
    request: RecommendationRequest,
    db: Session = Depends(get_db)
):
    """Analyze user behavior and update patterns"""
    user_data = get_user_data(request.user_id, db)
    
    result = ai_engine.analyze_and_learn(request.user_id, user_data)
    
    return result

@router.post("/coaching")
async def get_coaching_advice(
    request: RecommendationRequest,
    db: Session = Depends(get_db)
):
    """Get life coaching advice"""
    user_data = get_user_data(request.user_id, db)
    
    coaching = ai_engine.generate_coaching_advice(user_data)
    
    return coaching

