"""
Calendar integration routes
OAuth flows for Google, Apple, and Microsoft 365
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.models.database import get_db, User
from app.services.calendar_integration import CalendarIntegrationService
from datetime import datetime, timedelta

router = APIRouter()
calendar_service = CalendarIntegrationService()

@router.get("/google/auth")
async def google_auth(redirect_uri: str = Query(...)):
    """Initiate Google Calendar OAuth flow"""
    auth_url = calendar_service.get_google_auth_url(redirect_uri)
    return {"auth_url": auth_url}

@router.get("/google/callback")
async def google_callback(
    code: str = Query(...),
    redirect_uri: str = Query(...),
    db: Session = Depends(get_db)
):
    """Handle Google OAuth callback"""
    try:
        token_data = await calendar_service.exchange_google_code(code, redirect_uri)
        
        # Save tokens to user (in production, store in database)
        # For now, return success
        return {
            "status": "success",
            "message": "Google Calendar connected",
            "access_token": token_data.get("access_token")[:20] + "..."  # Don't return full token
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/microsoft/auth")
async def microsoft_auth(redirect_uri: str = Query(...)):
    """Initiate Microsoft 365 OAuth flow"""
    auth_url = calendar_service.get_microsoft_auth_url(redirect_uri)
    return {"auth_url": auth_url}

@router.get("/microsoft/callback")
async def microsoft_callback(
    code: str = Query(...),
    redirect_uri: str = Query(...),
    db: Session = Depends(get_db)
):
    """Handle Microsoft OAuth callback"""
    try:
        token_data = await calendar_service.exchange_microsoft_code(code, redirect_uri)
        return {
            "status": "success",
            "message": "Microsoft 365 Calendar connected"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/events")
async def get_calendar_events(
    user_id: int = Query(...),
    start_date: str = Query(...),
    end_date: str = Query(...),
    calendar_type: str = Query("google"),  # google, microsoft, apple
    db: Session = Depends(get_db)
):
    """Fetch events from connected calendar"""
    # In production, retrieve stored access token from database
    # For now, return mock data structure
    return {
        "events": [],
        "message": "Calendar integration requires OAuth setup. Configure API keys in environment variables."
    }

@router.post("/apple/connect")
async def connect_apple_calendar(
    server_url: str,
    username: str,
    password: str,
    user_id: int,
    db: Session = Depends(get_db)
):
    """Connect to Apple Calendar via CalDAV"""
    success = await calendar_service.connect_apple_calendar(server_url, username, password)
    if success:
        return {"status": "success", "message": "Apple Calendar connected"}
    else:
        raise HTTPException(status_code=400, detail="Failed to connect to Apple Calendar")

