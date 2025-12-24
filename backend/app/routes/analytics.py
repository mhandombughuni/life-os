"""
Analytics and metrics routes
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.database import get_db, Metric, Habit, Goal
from app.models.schemas import MetricsResponse, InsightsResponse
from ml.behavior_analyzer import BehaviorAnalyzer
# from ml.metrics_service import MetricsService  # Uncomment if needed
from datetime import datetime, timedelta

router = APIRouter()
behavior_analyzer = BehaviorAnalyzer()

@router.post("/metrics", response_model=MetricsResponse)
async def save_metrics(
    user_id: int = None,
    date: str = None,
    productivity_score: float = 0,
    habit_completion_rate: float = 0,
    goal_progress_rate: float = 0,
    schedule_adherence: float = 0,
    db: Session = Depends(get_db)
):
    """Save daily metrics"""
    # Check if metric exists
    existing = db.query(Metric).filter(
        Metric.user_id == user_id,
        Metric.date == date
    ).first()
    
    if existing:
        existing.productivity_score = productivity_score
        existing.habit_completion_rate = habit_completion_rate
        existing.goal_progress_rate = goal_progress_rate
        existing.schedule_adherence = schedule_adherence
    else:
        existing = Metric(
            user_id=user_id,
            date=date,
            productivity_score=productivity_score,
            habit_completion_rate=habit_completion_rate,
            goal_progress_rate=goal_progress_rate,
            schedule_adherence=schedule_adherence
        )
        db.add(existing)
    
    db.commit()
    db.refresh(existing)
    
    return MetricsResponse(
        date=existing.date,
        productivity_score=existing.productivity_score,
        habit_completion_rate=existing.habit_completion_rate,
        goal_progress_rate=existing.goal_progress_rate,
        schedule_adherence=existing.schedule_adherence
    )

@router.get("/insights", response_model=InsightsResponse)
async def get_insights(user_id: int = None, days: int = 7, db: Session = Depends(get_db)):
    """Get AI-powered insights"""
    # Get habits
    start_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    habits = db.query(Habit).filter(
        Habit.user_id == user_id,
        Habit.date >= start_date
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
        Metric.date >= start_date
    ).all()
    
    metrics_data = [{
        "date": m.date,
        "productivity_score": m.productivity_score,
        "timestamp": m.created_at.isoformat() if m.created_at else None
    } for m in metrics]
    
    # Get goals
    goals = db.query(Goal).filter(Goal.user_id == user_id).all()
    goals_data = [{
        "current_value": g.current_value,
        "target_value": g.target_value
    } for g in goals]
    
    # Analyze
    habit_strengths = behavior_analyzer.analyze_habit_strengths(habit_history)
    
    strengths = [
        {"habit": k, "completion_rate": v}
        for k, v in habit_strengths.items() if v > 0.7
    ]
    
    improvements = [
        {"habit": k, "completion_rate": v}
        for k, v in habit_strengths.items() if v < 0.5
    ]
    
    # Calculate trends
    if metrics_data:
        recent_scores = [m["productivity_score"] for m in metrics_data[-7:]]
        previous_scores = [m["productivity_score"] for m in metrics_data[-14:-7]] if len(metrics_data) >= 14 else recent_scores
        recent_avg = sum(recent_scores) / len(recent_scores)
        previous_avg = sum(previous_scores) / len(previous_scores) if previous_scores else recent_avg
        
        trend = "improving" if recent_avg > previous_avg else "declining" if recent_avg < previous_avg else "stable"
    else:
        trend = "stable"
        recent_avg = 0
    
    return InsightsResponse(
        strengths=strengths,
        improvements=improvements,
        trends={
            "direction": trend,
            "average_score": recent_avg,
            "best_day": max(metrics_data, key=lambda x: x["productivity_score"]) if metrics_data else None
        },
        recommendations=[
            f"Focus on {imp['habit']}" for imp in improvements[:3]
        ]
    )

