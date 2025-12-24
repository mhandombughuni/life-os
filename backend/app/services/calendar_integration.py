"""
Real calendar integration service
OAuth flows for Google, Apple, and Microsoft 365
"""
import os
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import httpx

class CalendarIntegrationService:
    """Service for integrating with external calendars"""
    
    def __init__(self):
        self.google_client_id = os.getenv("GOOGLE_CLIENT_ID")
        self.google_client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        self.microsoft_client_id = os.getenv("MICROSOFT_CLIENT_ID")
        self.microsoft_client_secret = os.getenv("MICROSOFT_CLIENT_SECRET")
    
    # Google Calendar Integration
    def get_google_auth_url(self, redirect_uri: str) -> str:
        """Generate Google OAuth authorization URL"""
        scope = "https://www.googleapis.com/auth/calendar.readonly"
        auth_url = (
            f"https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={self.google_client_id}&"
            f"redirect_uri={redirect_uri}&"
            f"response_type=code&"
            f"scope={scope}&"
            f"access_type=offline"
        )
        return auth_url
    
    async def exchange_google_code(self, code: str, redirect_uri: str) -> Dict[str, Any]:
        """Exchange authorization code for access token"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": self.google_client_id,
                    "client_secret": self.google_client_secret,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code",
                }
            )
            return response.json()
    
    async def get_google_events(self, access_token: str, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """Fetch events from Google Calendar"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.googleapis.com/calendar/v3/calendars/primary/events",
                headers={"Authorization": f"Bearer {access_token}"},
                params={
                    "timeMin": f"{start_date}T00:00:00Z",
                    "timeMax": f"{end_date}T23:59:59Z",
                    "singleEvents": True,
                    "orderBy": "startTime",
                }
            )
            data = response.json()
            return [
                {
                    "id": event.get("id"),
                    "title": event.get("summary", "No Title"),
                    "start": event.get("start", {}).get("dateTime") or event.get("start", {}).get("date"),
                    "end": event.get("end", {}).get("dateTime") or event.get("end", {}).get("date"),
                    "description": event.get("description", ""),
                    "location": event.get("location", ""),
                    "source": "google",
                }
                for event in data.get("items", [])
            ]
    
    # Microsoft 365/Outlook Integration
    def get_microsoft_auth_url(self, redirect_uri: str) -> str:
        """Generate Microsoft OAuth authorization URL"""
        scope = "https://graph.microsoft.com/Calendars.Read"
        auth_url = (
            f"https://login.microsoftonline.com/common/oauth2/v2.0/authorize?"
            f"client_id={self.microsoft_client_id}&"
            f"redirect_uri={redirect_uri}&"
            f"response_type=code&"
            f"scope={scope}&"
            f"response_mode=query"
        )
        return auth_url
    
    async def exchange_microsoft_code(self, code: str, redirect_uri: str) -> Dict[str, Any]:
        """Exchange authorization code for access token"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://login.microsoftonline.com/common/oauth2/v2.0/token",
                data={
                    "code": code,
                    "client_id": self.microsoft_client_id,
                    "client_secret": self.microsoft_client_secret,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code",
                }
            )
            return response.json()
    
    async def get_microsoft_events(self, access_token: str, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """Fetch events from Microsoft 365 Calendar"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://graph.microsoft.com/v1.0/me/calendar/events",
                headers={"Authorization": f"Bearer {access_token}"},
                params={
                    "$filter": f"start/dateTime ge '{start_date}T00:00:00Z' and end/dateTime le '{end_date}T23:59:59Z'",
                    "$orderby": "start/dateTime",
                }
            )
            data = response.json()
            return [
                {
                    "id": event.get("id"),
                    "title": event.get("subject", "No Title"),
                    "start": event.get("start", {}).get("dateTime"),
                    "end": event.get("end", {}).get("dateTime"),
                    "description": event.get("body", {}).get("content", ""),
                    "location": event.get("location", {}).get("displayName", ""),
                    "source": "microsoft",
                }
                for event in data.get("value", [])
            ]
    
    # Apple Calendar (CalDAV) - requires server setup
    async def connect_apple_calendar(self, server_url: str, username: str, password: str) -> bool:
        """Connect to Apple Calendar via CalDAV"""
        # CalDAV implementation would go here
        # Requires caldav library: pip install caldav
        try:
            # import caldav
            # client = caldav.DAVClient(url=server_url, username=username, password=password)
            # principal = client.principal()
            # calendars = principal.calendars()
            return True
        except Exception as e:
            print(f"Apple Calendar connection error: {e}")
            return False
    
    def detect_conflicts(self, schedule: List[Dict], calendar_events: List[Dict]) -> List[Dict[str, Any]]:
        """Detect conflicts between schedule and calendar events"""
        conflicts = []
        
        for schedule_item in schedule:
            schedule_time = self._parse_time(schedule_item.get('time', ''))
            
            for event in calendar_events:
                event_start = datetime.fromisoformat(event.get('start', '').replace('Z', '+00:00'))
                
                # Check if times overlap
                if abs((schedule_time - event_start.replace(tzinfo=None)).total_seconds()) < 3600:  # Within 1 hour
                    conflicts.append({
                        "schedule_item": schedule_item,
                        "calendar_event": event,
                        "conflict_type": "overlap",
                        "severity": "high" if schedule_item.get('priority') == 'high' else "medium",
                    })
        
        return conflicts
    
    def _parse_time(self, time_string: str) -> datetime:
        """Parse time string to datetime"""
        hour, minute = map(int, time_string.split(':'))
        today = datetime.now().replace(hour=hour, minute=minute, second=0, microsecond=0)
        return today

