"""
AI-powered recommendation engine
Combines ML models with rule-based systems for personalized recommendations
"""
from typing import List, Dict, Any
from ml.behavior_analyzer import BehaviorAnalyzer
from ml.habit_builder import HabitBuilder
from ml.strategic_planner import StrategicPlanner
import os

class AIEngine:
    """Main AI engine that orchestrates ML models and generates recommendations"""
    
    def __init__(self):
        self.behavior_analyzer = BehaviorAnalyzer()
        self.habit_builder = HabitBuilder()
        self.strategic_planner = StrategicPlanner()
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
    
    def generate_personalized_recommendations(self, user_data: Dict) -> Dict[str, Any]:
        """
        Generate comprehensive personalized recommendations
        """
        recommendations = {
            "schedule": [],
            "habits": [],
            "goals": [],
            "nudges": [],
            "strategic_plan": None
        }
        
        # Analyze behavior patterns
        metrics = user_data.get('metrics', [])
        habits = user_data.get('habits', [])
        goals = user_data.get('goals', [])
        
        # Generate optimal schedule
        if metrics or habits:
            recommendations["schedule"] = self.behavior_analyzer.predict_optimal_schedule({
                "metrics": metrics,
                "habits": habits,
                "goals": goals
            })
        
        # Analyze habit strengths and suggest improvements
        habit_strengths = self.behavior_analyzer.analyze_habit_strengths(habits)
        for habit_key, strength in habit_strengths.items():
            if strength < 0.5:
                recommendations["habits"].append({
                    "habit": habit_key,
                    "action": "improve",
                    "suggestions": self.habit_builder.suggest_habit_modifications(
                        habit_key, {"time_related": True}
                    )
                })
        
        # Generate strategic plan
        user_profile = user_data.get('profile', {})
        challenges = user_profile.get('challenges', [])
        recommendations["strategic_plan"] = self.strategic_planner.create_strategic_plan(
            user_profile, goals, challenges
        )
        
        # Generate nudges
        for habit_key, strength in habit_strengths.items():
            # Get streak (simplified - in production would calculate from history)
            streak = 0  # Would calculate from habit history
            nudge = self.habit_builder.generate_habit_nudge(habit_key, streak, strength)
            recommendations["nudges"].append(nudge)
        
        return recommendations
    
    def analyze_and_learn(self, user_id: int, new_data: Dict) -> Dict[str, Any]:
        """
        Analyze new data and update user behavior patterns
        """
        # Detect behavior changes
        # In production, would compare with historical data
        
        # Update behavior patterns
        patterns = {
            "productivity_patterns": self.behavior_analyzer.analyze_productivity_patterns(
                new_data.get('metrics', [])
            ),
            "habit_strengths": self.behavior_analyzer.analyze_habit_strengths(
                new_data.get('habits', [])
            )
        }
        
        return {
            "patterns_updated": True,
            "new_patterns": patterns,
            "recommendations_updated": True
        }
    
    def generate_coaching_advice(self, user_data: Dict) -> Dict[str, Any]:
        """
        Generate life coaching advice based on user's situation
        """
        insights = self.strategic_planner.generate_coaching_insights(user_data)
        
        # Generate motivational message
        productivity_score = 0
        if user_data.get('metrics'):
            recent_metrics = user_data['metrics'][-7:] if len(user_data['metrics']) >= 7 else user_data['metrics']
            productivity_score = sum(m.get('productivity_score', 0) for m in recent_metrics) / len(recent_metrics) if recent_metrics else 0
        
        if productivity_score > 80:
            motivational_message = "You're doing exceptionally well! Keep up the momentum."
        elif productivity_score > 60:
            motivational_message = "You're making great progress. Small consistent actions lead to big results."
        else:
            motivational_message = "Every journey starts with a single step. Focus on consistency over perfection."
        
        return {
            "insights": insights,
            "motivational_message": motivational_message,
            "action_plan": insights.get("next_steps", []),
            "focus_areas": self._identify_focus_areas(user_data)
        }
    
    def _identify_focus_areas(self, user_data: Dict) -> List[str]:
        """Identify areas that need focus"""
        focus_areas = []
        
        goals = user_data.get('goals', [])
        incomplete_goals = [g for g in goals if g.get('current_value', 0) < g.get('target_value', 1) * 0.5]
        if incomplete_goals:
            focus_areas.append(f"Goal: {incomplete_goals[0].get('name')}")
        
        challenges = user_data.get('profile', {}).get('challenges', [])
        if challenges:
            focus_areas.append(f"Challenge: {challenges[0]}")
        
        return focus_areas[:3]

