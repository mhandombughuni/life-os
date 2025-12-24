"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# User schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    onboarding_complete: bool
    challenges: List[str] = []
    goals: List[str] = []
    
    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    challenges: Optional[List[str]] = None
    goals: Optional[List[str]] = None
    preferences: Optional[Dict[str, Any]] = None

# Habit schemas
class HabitCreate(BaseModel):
    habit_key: str
    date: str
    completed: bool = False
    notes: Optional[str] = None

class HabitResponse(BaseModel):
    id: int
    user_id: int
    habit_key: str
    date: str
    completed: bool
    completion_time: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class HabitBatchUpdate(BaseModel):
    habits: Dict[str, bool]  # {habit_key: completed}
    date: str

# Goal schemas
class GoalCreate(BaseModel):
    name: str
    current_value: float = 0
    target_value: float
    category: str
    deadline: Optional[datetime] = None

class GoalUpdate(BaseModel):
    name: Optional[str] = None
    current_value: Optional[float] = None
    target_value: Optional[float] = None
    category: Optional[str] = None
    deadline: Optional[datetime] = None

class GoalResponse(BaseModel):
    id: int
    user_id: int
    name: str
    current_value: float
    target_value: float
    category: str
    deadline: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Analytics schemas
class MetricsResponse(BaseModel):
    date: str
    productivity_score: float
    habit_completion_rate: float
    goal_progress_rate: float
    schedule_adherence: float

class InsightsResponse(BaseModel):
    strengths: List[Dict[str, Any]]
    improvements: List[Dict[str, Any]]
    trends: Dict[str, Any]
    recommendations: List[str]

# AI Recommendation schemas
class RecommendationRequest(BaseModel):
    user_id: int
    context: Optional[Dict[str, Any]] = None

class RecommendationResponse(BaseModel):
    recommendations: List[Dict[str, Any]]
    reasoning: str
    confidence: float

# Coaching schemas
class CoachingRequest(BaseModel):
    user_id: int
    focus_area: Optional[str] = None

class CoachingResponse(BaseModel):
    action_plan: List[Dict[str, Any]]
    strategies: List[str]
    next_steps: List[str]
    motivational_message: str

