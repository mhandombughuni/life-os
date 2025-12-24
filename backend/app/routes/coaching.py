"""
Life coaching routes
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.schemas import CoachingRequest, CoachingResponse
from app.services.ai_engine import AIEngine
from app.routes.ai_recommendations import get_user_data

router = APIRouter()
ai_engine = AIEngine()

@router.post("/plan", response_model=CoachingResponse)
async def get_coaching_plan(
    request: CoachingRequest,
    db: Session = Depends(get_db)
):
    """Generate a personalized coaching plan"""
    user_data = get_user_data(request.user_id, db)
    
    coaching_data = ai_engine.generate_coaching_advice(user_data)
    strategic_plan = ai_engine.strategic_planner.create_strategic_plan(
        user_data.get('profile', {}),
        user_data.get('goals', []),
        user_data.get('profile', {}).get('challenges', [])
    )
    
    return CoachingResponse(
        action_plan=strategic_plan.get('action_plan', []),
        strategies=coaching_data.get('insights', {}).get('next_steps', []),
        next_steps=coaching_data.get('action_plan', []),
        motivational_message=coaching_data.get('motivational_message', 'Keep going!')
    )

