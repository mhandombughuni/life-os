"""
Machine Learning models for analyzing user behavior patterns
"""
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
from typing import List, Dict, Any
import json

class BehaviorAnalyzer:
    """Analyzes user behavior patterns using ML algorithms"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        
    def analyze_productivity_patterns(self, metrics_data: List[Dict]) -> Dict[str, Any]:
        """
        Analyze productivity patterns using clustering and time series analysis
        """
        if len(metrics_data) < 7:
            return {"pattern": "insufficient_data", "confidence": 0.0}
        
        df = pd.DataFrame(metrics_data)
        
        # Extract features
        df['hour'] = pd.to_datetime(df.get('timestamp', df.get('date'))).dt.hour
        df['day_of_week'] = pd.to_datetime(df.get('timestamp', df.get('date'))).dt.dayofweek
        df['productivity'] = df.get('productivity_score', df.get('score', 0))
        
        # Identify peak productivity hours
        hourly_avg = df.groupby('hour')['productivity'].mean()
        peak_hours = hourly_avg.nlargest(3).index.tolist()
        
        # Identify best days
        daily_avg = df.groupby('day_of_week')['productivity'].mean()
        best_day = daily_avg.idxmax()
        
        # Trend analysis
        df_sorted = df.sort_values('date' if 'date' in df.columns else 'timestamp')
        recent_avg = df_sorted.tail(7)['productivity'].mean()
        previous_avg = df_sorted.iloc[-14:-7]['productivity'].mean() if len(df_sorted) >= 14 else recent_avg
        
        trend = "improving" if recent_avg > previous_avg else "declining" if recent_avg < previous_avg else "stable"
        
        return {
            "pattern": "productivity_analysis",
            "peak_hours": [int(h) for h in peak_hours],
            "best_day": int(best_day),
            "trend": trend,
            "average_productivity": float(recent_avg),
            "confidence": min(len(metrics_data) / 30, 1.0)
        }
    
    def analyze_habit_strengths(self, habit_history: List[Dict]) -> Dict[str, float]:
        """
        Analyze which habits are strongest (highest completion rates)
        """
        if not habit_history:
            return {}
        
        habit_stats = {}
        
        for day_data in habit_history:
            habits = day_data.get('habits', {})
            for habit_key, completed in habits.items():
                if habit_key not in habit_stats:
                    habit_stats[habit_key] = {"completed": 0, "total": 0}
                habit_stats[habit_key]["total"] += 1
                if completed:
                    habit_stats[habit_key]["completed"] += 1
        
        # Calculate completion rates
        strength_scores = {
            habit: stats["completed"] / stats["total"] if stats["total"] > 0 else 0
            for habit, stats in habit_stats.items()
        }
        
        return strength_scores
    
    def predict_optimal_schedule(self, user_data: Dict) -> List[Dict[str, Any]]:
        """
        Predict optimal schedule based on behavior patterns
        """
        metrics = user_data.get('metrics', [])
        habits = user_data.get('habits', [])
        goals = user_data.get('goals', [])
        
        # Analyze patterns
        productivity_pattern = self.analyze_productivity_patterns(metrics)
        habit_strengths = self.analyze_habit_strengths(habits)
        
        # Generate schedule recommendations
        schedule = []
        
        # Morning routine (based on habit strengths)
        strong_habits = [h for h, score in habit_strengths.items() if score > 0.7]
        if strong_habits:
            schedule.append({
                "time": "06:30",
                "activity": f"Morning: {strong_habits[0].replace('_', ' ').title()}",
                "type": "habit",
                "priority": "high"
            })
        
        # Peak productivity work block
        if productivity_pattern.get('peak_hours'):
            peak_hour = productivity_pattern['peak_hours'][0]
            schedule.append({
                "time": f"{peak_hour:02d}:00",
                "activity": "Deep Work Session (Peak Productivity)",
                "type": "work",
                "priority": "high"
            })
        
        # Goal-focused activities
        active_goals = [g for g in goals if g.get('current_value', 0) < g.get('target_value', 1)]
        if active_goals:
            schedule.append({
                "time": "14:00",
                "activity": f"Work on: {active_goals[0].get('name', 'Goal')}",
                "type": "goal",
                "priority": "high"
            })
        
        # Evening routine
        schedule.append({
            "time": "18:00",
            "activity": "Evening Routine & Planning",
            "type": "personal",
            "priority": "medium"
        })
        
        return schedule
    
    def detect_behavior_changes(self, recent_data: List[Dict], historical_data: List[Dict]) -> Dict[str, Any]:
        """
        Detect significant changes in behavior patterns
        """
        if len(recent_data) < 7 or len(historical_data) < 14:
            return {"changes_detected": False}
        
        recent_df = pd.DataFrame(recent_data)
        historical_df = pd.DataFrame(historical_data)
        
        recent_avg = recent_df.get('productivity_score', recent_df.get('score', 0)).mean()
        historical_avg = historical_df.get('productivity_score', historical_df.get('score', 0)).mean()
        
        change_percentage = ((recent_avg - historical_avg) / historical_avg * 100) if historical_avg > 0 else 0
        
        return {
            "changes_detected": abs(change_percentage) > 10,
            "change_percentage": float(change_percentage),
            "direction": "improving" if change_percentage > 0 else "declining",
            "significance": "high" if abs(change_percentage) > 20 else "medium" if abs(change_percentage) > 10 else "low"
        }

