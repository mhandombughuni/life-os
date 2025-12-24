"""
User management routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db, User
from app.models.schemas import UserResponse, UserProfileUpdate

router = APIRouter()

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}/profile")
async def update_profile(
    user_id: int,
    profile_data: UserProfileUpdate,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if profile_data.name:
        user.name = profile_data.name
    if profile_data.challenges:
        user.challenges = profile_data.challenges
    if profile_data.goals:
        user.goals = profile_data.goals
    if profile_data.preferences:
        user.preferences = {**user.preferences, **profile_data.preferences}
    
    db.commit()
    db.refresh(user)
    return {"message": "Profile updated", "user": UserResponse.from_orm(user)}

@router.post("/{user_id}/onboarding-complete")
async def complete_onboarding(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.onboarding_complete = True
    db.commit()
    return {"message": "Onboarding completed"}

