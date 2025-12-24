"""
Goals management routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db, Goal
from app.models.schemas import GoalCreate, GoalUpdate, GoalResponse

router = APIRouter()

@router.post("/", response_model=GoalResponse)
async def create_goal(goal: GoalCreate, user_id: int = None, db: Session = Depends(get_db)):
    db_goal = Goal(
        user_id=user_id,
        name=goal.name,
        current_value=goal.current_value,
        target_value=goal.target_value,
        category=goal.category,
        deadline=goal.deadline
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.get("/", response_model=list[GoalResponse])
async def get_goals(user_id: int = None, db: Session = Depends(get_db)):
    goals = db.query(Goal).filter(Goal.user_id == user_id).all()
    return goals

@router.put("/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: int,
    goal_update: GoalUpdate,
    user_id: int = None,
    db: Session = Depends(get_db)
):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    if goal_update.name:
        goal.name = goal_update.name
    if goal_update.current_value is not None:
        goal.current_value = goal_update.current_value
    if goal_update.target_value is not None:
        goal.target_value = goal_update.target_value
    if goal_update.category:
        goal.category = goal_update.category
    if goal_update.deadline:
        goal.deadline = goal_update.deadline
    
    db.commit()
    db.refresh(goal)
    return goal

@router.delete("/{goal_id}")
async def delete_goal(goal_id: int, user_id: int = None, db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    db.delete(goal)
    db.commit()
    return {"message": "Goal deleted"}

