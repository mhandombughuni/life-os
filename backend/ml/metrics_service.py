"""
Metrics calculation service
"""
from typing import List, Dict
from datetime import datetime

class MetricsService:
    """Calculate productivity metrics and scores"""
    
    @staticmethod
    def calculate_daily_score(habits: Dict[str, bool], goals: List[Dict], schedule_completion: float = 0.8) -> float:
        """Calculate daily productivity score (0-100)"""
        if not habits:
            return 0.0
        
        habit_count = len(habits)
        completed_habits = sum(1 for v in habits.values() if v)
        habit_score = (completed_habits / habit_count) * 50 if habit_count > 0 else 0
        
        schedule_score = schedule_completion * 30
        
        goal_progress_score = 0
        if goals:
            total_progress = sum(
                (g.get('current_value', 0) / g.get('target_value', 1)) * (20 / len(goals))
                for g in goals if g.get('target_value', 0) > 0
            )
            goal_progress_score = min(total_progress, 20)
        
        return round(habit_score + schedule_score + goal_progress_score, 2)
    
    @staticmethod
    def calculate_streak(habit_history: List[Dict], habit_key: str) -> int:
        """Calculate streak for a specific habit"""
        if not habit_history:
            return 0
        
        # Sort by date (most recent first)
        sorted_history = sorted(habit_history, key=lambda x: x.get('date', ''), reverse=True)
        
        streak = 0
        today = datetime.now().strftime("%Y-%m-%d")
        
        # Check today
        today_data = next((h for h in sorted_history if h.get('date') == today), None)
        if today_data and today_data.get('habits', {}).get(habit_key):
            streak = 1
        else:
            return 0
        
        # Count backwards
        for i, day_data in enumerate(sorted_history[1:], 1):
            if day_data.get('habits', {}).get(habit_key):
                streak += 1
            else:
                break
        
        return streak

