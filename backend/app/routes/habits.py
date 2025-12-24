"""
Habits tracking routes
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.database import get_db, Habit
from app.models.schemas import HabitCreate, HabitResponse, HabitBatchUpdate
from datetime import datetime, timedelta

router = APIRouter()

@router.post("/", response_model=HabitResponse)
async def create_habit(habit: HabitCreate, user_id: int = None, db: Session = Depends(get_db)):
    db_habit = Habit(
        user_id=user_id,
        habit_key=habit.habit_key,
        date=habit.date,
        completed=habit.completed,
        notes=habit.notes,
        completion_time=datetime.utcnow() if habit.completed else None
    )
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit

@router.post("/batch-update")
async def batch_update_habits(
    batch: HabitBatchUpdate,
    user_id: int = None,
    db: Session = Depends(get_db)
):
    """Update multiple habits for a date"""
    results = []
    
    for habit_key, completed in batch.habits.items():
        # Check if habit exists
        existing = db.query(Habit).filter(
            Habit.user_id == user_id,
            Habit.habit_key == habit_key,
            Habit.date == batch.date
        ).first()
        
        if existing:
            existing.completed = completed
            existing.completion_time = datetime.utcnow() if completed else None
        else:
            existing = Habit(
                user_id=user_id,
                habit_key=habit_key,
                date=batch.date,
                completed=completed,
                completion_time=datetime.utcnow() if completed else None
            )
            db.add(existing)
        
        results.append(HabitResponse.from_orm(existing))
    
    db.commit()
    return {"habits": results}

@router.get("/history")
async def get_habit_history(
    user_id: int = None,
    days: int = 30,
    db: Session = Depends(get_db)
):
    """Get habit history for the last N days"""
    start_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    
    habits = db.query(Habit).filter(
        Habit.user_id == user_id,
        Habit.date >= start_date
    ).order_by(Habit.date.desc()).all()
    
    # Group by date
    history = {}
    for habit in habits:
        if habit.date not in history:
            history[habit.date] = {}
        history[habit.date][habit.habit_key] = habit.completed
    
    return {"history": history}

