"""
Strategy App - AI-Powered Life Organizer Backend
FastAPI application with ML/AI capabilities
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from dotenv import load_dotenv
import os

from app.routes import auth, users, habits, goals, analytics, ai_recommendations, coaching

load_dotenv()

app = FastAPI(
    title="Strategy API",
    description="AI-Powered Life Organizer Backend with ML/AI capabilities",
    version="1.0.0"
)

# CORS middleware for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(habits.router, prefix="/api/habits", tags=["Habits"])
app.include_router(goals.router, prefix="/api/goals", tags=["Goals"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(ai_recommendations.router, prefix="/api/ai", tags=["AI Recommendations"])
app.include_router(coaching.router, prefix="/api/coaching", tags=["Life Coaching"])

@app.get("/")
async def root():
    return {"message": "Strategy API - AI-Powered Life Organizer", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "strategy-api"}

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

