"""
AI-powered habit building and optimization algorithms
Based on behavioral science principles (Atomic Habits, BJ Fogg's Tiny Habits, etc.)
"""
from typing import List, Dict, Any
from datetime import datetime, timedelta
import numpy as np

class HabitBuilder:
    """Builds and optimizes habits using behavioral science principles"""
    
    def __init__(self):
        self.habit_stages = {
            "formation": 0.21,  # 21 days (myth, but useful baseline)
            "consolidation": 0.66,  # 66 days average
            "mastery": 1.0  # 100+ days
        }
    
    def calculate_habit_stage(self, streak_days: int) -> str:
        """Determine what stage a habit is in based on streak"""
        if streak_days < 21:
            return "formation"
        elif streak_days < 66:
            return "consolidation"
        else:
            return "mastery"
    
    def suggest_habit_chaining(self, existing_habits: List[str], new_habit: str) -> Dict[str, Any]:
        """
        Suggest habit stacking/chaining based on existing strong habits
        Uses James Clear's habit stacking principle
        """
        # Find strongest existing habit (highest completion rate)
        if not existing_habits:
            return {
                "anchor_habit": None,
                "suggestion": f"Start with '{new_habit}' as your first habit"
            }
        
        # In real implementation, would analyze completion rates
        # For now, use first habit as anchor
        anchor = existing_habits[0] if existing_habits else None
        
        return {
            "anchor_habit": anchor,
            "suggestion": f"After you complete '{anchor}', do '{new_habit}'",
            "formula": f"After [CURRENT HABIT], I will [NEW HABIT]"
        }
    
    def optimize_habit_timing(self, habit_key: str, completion_history: List[Dict]) -> Dict[str, Any]:
        """
        Optimize when a habit should be performed based on completion patterns
        """
        if not completion_history:
            return {
                "optimal_time": "morning",
                "confidence": 0.0,
                "reasoning": "Insufficient data"
            }
        
        # Analyze completion times
        completion_times = []
        for record in completion_history:
            if record.get('completed') and record.get('completion_time'):
                hour = datetime.fromisoformat(record['completion_time']).hour
                completion_times.append(hour)
        
        if not completion_times:
            return {
                "optimal_time": "morning",
                "confidence": 0.3,
                "reasoning": "No completion time data available"
            }
        
        # Find most common completion hour
        hour_counts = {}
        for hour in completion_times:
            hour_counts[hour] = hour_counts.get(hour, 0) + 1
        
        most_common_hour = max(hour_counts, key=hour_counts.get)
        
        # Categorize time of day
        if 5 <= most_common_hour < 12:
            time_category = "morning"
        elif 12 <= most_common_hour < 17:
            time_category = "afternoon"
        elif 17 <= most_common_hour < 21:
            time_category = "evening"
        else:
            time_category = "night"
        
        confidence = len(completion_times) / 30  # More data = higher confidence
        
        return {
            "optimal_time": time_category,
            "optimal_hour": most_common_hour,
            "confidence": min(confidence, 1.0),
            "reasoning": f"Based on {len(completion_times)} completion records"
        }
    
    def generate_habit_nudge(self, habit_key: str, streak: int, completion_rate: float) -> Dict[str, Any]:
        """
        Generate personalized nudges based on habit performance
        Uses behavioral science principles
        """
        if streak >= 7:
            return {
                "type": "celebration",
                "message": f"🔥 Amazing! {streak}-day streak with {habit_key}! You're building momentum!",
                "priority": "high",
                "action": "celebrate"
            }
        elif completion_rate < 0.3:
            return {
                "type": "support",
                "message": f"Let's make {habit_key} easier. Try the 2-minute rule: just 2 minutes today!",
                "priority": "high",
                "action": "simplify"
            }
        elif completion_rate < 0.5:
            return {
                "type": "encouragement",
                "message": f"You're making progress with {habit_key}. Consistency > perfection!",
                "priority": "medium",
                "action": "encourage"
            }
        else:
            return {
                "type": "maintenance",
                "message": f"Keep up the great work with {habit_key}!",
                "priority": "low",
                "action": "maintain"
            }
    
    def suggest_habit_modifications(self, habit_key: str, failure_pattern: Dict) -> List[str]:
        """
        Suggest modifications to improve habit success rate
        Based on failure analysis
        """
        suggestions = []
        
        if failure_pattern.get('time_related'):
            suggestions.append(f"Try doing {habit_key} at a different time of day")
        
        if failure_pattern.get('complexity_related'):
            suggestions.append(f"Break {habit_key} into smaller, 2-minute actions")
        
        if failure_pattern.get('environment_related'):
            suggestions.append(f"Set up your environment to make {habit_key} easier")
        
        if failure_pattern.get('motivation_related'):
            suggestions.append(f"Connect {habit_key} to your deeper values and goals")
        
        return suggestions if suggestions else [
            f"Keep trying with {habit_key}. Progress takes time!"
        ]

