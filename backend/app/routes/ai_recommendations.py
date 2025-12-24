"""
AI-powered recommendations routes with real LLM integration
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db, User, Habit, Goal, Metric
from app.models.schemas import RecommendationRequest, RecommendationResponse
from app.services.ai_engine import AIEngine
from app.services.llm_service import LLMService
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()
ai_engine = AIEngine()
llm_service = LLMService()

class GenerateGoalsRequest(BaseModel):
    user_id: int
    strategic_focus: List[str]
    personal_pillars: List[str]
    challenges: List[str] = []

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
    """Get AI-powered personalized recommendations using LLM"""
    user_data = get_user_data(request.user_id, db)
    
    # Use LLM service for intelligent recommendations
    recommendations = ai_engine.generate_personalized_recommendations(user_data)
    
    # Enhance with LLM if available
    if llm_service.openai_client:
        # Add LLM-powered insights
        goals = user_data.get('goals', [])
        if goals:
            biggest_goal = max(goals, key=lambda g: g.get('target_value', 0))
            llm_insights = llm_service.generate_coaching_response(
                f"Provide strategic recommendations for achieving: {biggest_goal.get('name')}",
                user_data
            )
            recommendations["llm_insights"] = llm_insights
    
    return RecommendationResponse(
        recommendations=[
            {"type": "schedule", "data": recommendations["schedule"]},
            {"type": "habits", "data": recommendations["habits"]},
            {"type": "nudges", "data": recommendations["nudges"]},
            {"type": "strategic_plan", "data": recommendations["strategic_plan"]}
        ],
        reasoning="Based on your behavior patterns, habit strengths, and goals, enhanced with AI analysis",
        confidence=0.90 if llm_service.openai_client else 0.75
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
    request: dict,
    db: Session = Depends(get_db)
):
    """Get life coaching advice using LLM"""
    user_id = request.get('user_id')
    message = request.get('message', 'Provide personalized coaching advice based on my current situation')
    
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    
    user_data = get_user_data(user_id, db)
    
    # Use LLM for intelligent coaching
    if llm_service.openai_client:
        coaching_message = llm_service.generate_coaching_response(
            message,
            user_data
        )
        return {
            "message": coaching_message,
            "insights": ai_engine.generate_coaching_advice(user_data)
        }
    else:
        return ai_engine.generate_coaching_advice(user_data)

@router.post("/generate-goals")
async def generate_goals_from_strategy(
    request: GenerateGoalsRequest,
    db: Session = Depends(get_db)
):
    """Generate goals from strategic focus and personal pillars using LLM"""
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Use LLM to generate intelligent goals
    goals = llm_service.generate_goals_from_strategy(
        request.strategic_focus,
        request.personal_pillars,
        request.challenges
    )
    
    return {"goals": goals, "message": "Goals generated from your strategy"}

@router.post("/analyze-goal")
async def analyze_goal_with_llm(
    goal_text: str,
    user_id: int,
    context: dict,
    db: Session = Depends(get_db)
):
    """Analyze a goal using LLM and generate questions"""
    analysis = llm_service.analyze_goal(goal_text, context)
    return analysis

@router.post("/analyze-website")
async def analyze_business_website(
    website_url: str,
    user_id: int,
    db: Session = Depends(get_db)
):
    """Analyze business website using GPT-4 Vision"""
    analysis = await llm_service.analyze_website(website_url)
    return analysis

@router.post("/strategic-plan")
async def generate_strategic_plan(
    goal_data: dict,
    strategic_focus: List[str],
    personal_pillars: List[str],
    db: Session = Depends(get_db)
):
    """Generate comprehensive strategic plan using LLM"""
    plan = llm_service.generate_strategic_plan(goal_data, strategic_focus, personal_pillars)
    return plan
