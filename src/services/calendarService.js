// Calendar integration service for Apple, Google, and Outlook calendars
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const calendarService = {
  // Google Calendar integration - Real OAuth flow
  async connectGoogleCalendar() {
    try {
      const redirectUri = `${window.location.origin}/calendar/callback`;
      const response = await fetch(`${API_BASE_URL}/api/calendar/google/auth?redirect_uri=${encodeURIComponent(redirectUri)}`);
      
      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.auth_url) {
        // Redirect to Google OAuth
        window.location.href = data.auth_url;
      } else {
        throw new Error('No auth URL received from backend');
      }
    } catch (error) {
      console.error('Failed to initiate Google Calendar connection:', error);
      alert(`Failed to connect Google Calendar: ${error.message}. Please ensure the backend is running and OAuth credentials are configured.`);
    }
  },

  // Apple Calendar integration (via CalDAV)
  async connectAppleCalendar() {
    // Prompt for CalDAV server details
    const serverUrl = prompt('Enter your CalDAV server URL (e.g., https://caldav.icloud.com):');
    const username = prompt('Enter your Apple ID:');
    const password = prompt('Enter your app-specific password:');
    
    if (serverUrl && username && password) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/calendar/apple/connect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            server_url: serverUrl,
            username: username,
            password: password,
            user_id: JSON.parse(localStorage.getItem('strategy_user'))?.id,
          }),
        });
        
        const data = await response.json();
        if (data.status === 'success') {
          alert('Apple Calendar connected successfully!');
        }
      } catch (error) {
        console.error('Failed to connect Apple Calendar:', error);
        alert('Failed to connect Apple Calendar. Please check your credentials.');
      }
    }
  },

  // Outlook Calendar integration - Real OAuth flow
  async connectOutlookCalendar() {
    try {
      const redirectUri = `${window.location.origin}/calendar/callback`;
      const response = await fetch(`${API_BASE_URL}/api/calendar/microsoft/auth?redirect_uri=${encodeURIComponent(redirectUri)}`);
      
      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.auth_url) {
        // Redirect to Microsoft OAuth
        window.location.href = data.auth_url;
      } else {
        throw new Error('No auth URL received from backend');
      }
    } catch (error) {
      console.error('Failed to initiate Microsoft Calendar connection:', error);
      alert(`Failed to connect Microsoft 365 Calendar: ${error.message}. Please ensure the backend is running and OAuth credentials are configured.`);
    }
  },

  // Fetch events from connected calendars
  async getEvents(startDate, endDate) {
    // Fetch events from all connected calendars
    // In production, this would query the actual calendar APIs
    return [];
  },

  // Sync calendar events with app schedule
  async syncWithSchedule(events) {
    // Convert calendar events to schedule items
    return events.map(event => ({
      time: this.formatTime(event.start),
      label: event.summary || event.title,
      type: this.categorizeEvent(event),
      source: 'calendar',
      calendarId: event.calendarId,
      eventId: event.id,
    }));
  },

  // Detect schedule conflicts
  detectConflicts(schedule, calendarEvents) {
    const conflicts = [];
    
    schedule.forEach(scheduleItem => {
      const scheduleTime = this.parseTime(scheduleItem.time);
      
      calendarEvents.forEach(event => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        
        // Check if times overlap
        if (scheduleTime >= eventStart && scheduleTime <= eventEnd) {
          conflicts.push({
            scheduleItem,
            calendarEvent: event,
            conflictType: 'overlap',
            severity: this.calculateConflictSeverity(scheduleItem, event),
          });
        }
      });
    });
    
    return conflicts;
  },

  // Categorize event type
  categorizeEvent(event) {
    const summary = (event.summary || event.title || '').toLowerCase();
    
    if (summary.includes('meeting') || summary.includes('call')) return 'work';
    if (summary.includes('lunch') || summary.includes('dinner')) return 'personal';
    if (summary.includes('workout') || summary.includes('exercise')) return 'health';
    if (summary.includes('family') || summary.includes('kids')) return 'family';
    
    return 'work';
  },

  // Format time helper
  formatTime(date) {
    const d = new Date(date);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  },

  // Parse time helper
  parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  },

  // Calculate conflict severity
  calculateConflictSeverity(scheduleItem, calendarEvent) {
    // High priority items have higher severity
    if (scheduleItem.priority === 'high' || calendarEvent.priority === 'high') {
      return 'high';
    }
    return 'medium';
  },
};

