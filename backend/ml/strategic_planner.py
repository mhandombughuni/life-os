"""
Strategic planning and life coaching algorithms
Helps users organize their life strategically
"""
from typing import List, Dict, Any
from datetime import datetime, timedelta
import numpy as np

class StrategicPlanner:
    """Strategic planning and life coaching engine"""
    
    def __init__(self):
        self.life_domains = [
            "career", "finance", "health", "relationships", 
            "personal_growth", "spirituality", "recreation"
        ]
    
    def analyze_life_balance(self, goals: List[Dict], metrics: List[Dict]) -> Dict[str, Any]:
        """
        Analyze balance across life domains
        """
        domain_scores = {domain: 0 for domain in self.life_domains}
        domain_goals = {domain: 0 for domain in self.life_domains}
        
        # Score based on goals
        for goal in goals:
            category = goal.get('category', 'general')
            if category in domain_scores:
                progress = goal.get('current_value', 0) / goal.get('target_value', 1) if goal.get('target_value', 0) > 0 else 0
                domain_scores[category] += progress
                domain_goals[category] += 1
        
        # Normalize scores
        for domain in domain_scores:
            if domain_goals[domain] > 0:
                domain_scores[domain] = domain_scores[domain] / domain_goals[domain]
        
        # Identify imbalances
        avg_score = np.mean(list(domain_scores.values()))
        imbalances = {
            domain: score - avg_score
            for domain, score in domain_scores.items()
            if abs(score - avg_score) > 0.2
        }
        
        return {
            "domain_scores": domain_scores,
            "overall_balance": 1.0 - np.std(list(domain_scores.values())),  # Lower std = more balanced
            "imbalances": imbalances,
            "recommendations": self._generate_balance_recommendations(imbalances)
        }
    
    def _generate_balance_recommendations(self, imbalances: Dict[str, float]) -> List[str]:
        """Generate recommendations to improve life balance"""
        recommendations = []
        
        for domain, diff in imbalances.items():
            if diff < -0.2:  # Underperforming domain
                recommendations.append(
                    f"Consider setting goals or allocating more time to {domain.replace('_', ' ')}"
                )
            elif diff > 0.2:  # Overperforming domain
                recommendations.append(
                    f"You're doing well in {domain.replace('_', ' ')}. Consider focusing on other areas for balance."
                )
        
        return recommendations
    
    def create_strategic_plan(self, user_profile: Dict, goals: List[Dict], challenges: List[str]) -> Dict[str, Any]:
        """
        Create a comprehensive strategic life plan
        """
        # Analyze current state
        balance_analysis = self.analyze_life_balance(goals, [])
        
        # Identify priorities based on challenges
        priority_areas = self._identify_priorities(challenges, goals)
        
        # Create action plan
        action_plan = []
        for priority in priority_areas[:3]:  # Top 3 priorities
            actions = self._generate_actions_for_priority(priority, user_profile)
            action_plan.extend(actions)
        
        return {
            "strategic_focus": priority_areas[0] if priority_areas else "general",
            "action_plan": action_plan,
            "timeline": "90_days",
            "key_milestones": self._generate_milestones(goals),
            "balance_recommendations": balance_analysis["recommendations"]
        }
    
    def _identify_priorities(self, challenges: List[str], goals: List[Dict]) -> List[str]:
        """Identify priority areas based on challenges and goals"""
        priority_map = {
            "disorganized": "organization",
            "time-management": "productivity",
            "procrastination": "action",
            "focus": "deep_work",
            "work-life-balance": "balance"
        }
        
        priorities = []
        for challenge in challenges:
            if challenge in priority_map:
                priorities.append(priority_map[challenge])
        
        # Add goal-based priorities
        goal_categories = [g.get('category') for g in goals if g.get('category')]
        priorities.extend(goal_categories)
        
        # Remove duplicates and return top priorities
        return list(dict.fromkeys(priorities))[:5]
    
    def _generate_actions_for_priority(self, priority: str, user_profile: Dict) -> List[Dict[str, Any]]:
        """Generate specific actions for a priority area"""
        actions = {
            "organization": [
                {"action": "Set up daily planning routine", "frequency": "daily", "priority": "high"},
                {"action": "Create morning and evening routines", "frequency": "daily", "priority": "high"},
                {"action": "Use time-blocking for important tasks", "frequency": "daily", "priority": "medium"}
            ],
            "productivity": [
                {"action": "Identify your peak productivity hours", "frequency": "once", "priority": "high"},
                {"action": "Eliminate distractions during deep work", "frequency": "daily", "priority": "high"},
                {"action": "Use Pomodoro technique for focus", "frequency": "daily", "priority": "medium"}
            ],
            "action": [
                {"action": "Start with 2-minute rule for difficult tasks", "frequency": "daily", "priority": "high"},
                {"action": "Break large goals into tiny steps", "frequency": "weekly", "priority": "high"},
                {"action": "Celebrate small wins", "frequency": "daily", "priority": "medium"}
            ]
        }
        
        return actions.get(priority, [
            {"action": f"Focus on improving {priority}", "frequency": "daily", "priority": "medium"}
        ])
    
    def _generate_milestones(self, goals: List[Dict]) -> List[Dict[str, Any]]:
        """Generate milestones from goals"""
        milestones = []
        for goal in goals[:5]:  # Top 5 goals
            milestones.append({
                "title": f"25% progress on {goal.get('name')}",
                "target_value": goal.get('target_value', 0) * 0.25,
                "deadline_days": 30
            })
            milestones.append({
                "title": f"50% progress on {goal.get('name')}",
                "target_value": goal.get('target_value', 0) * 0.5,
                "deadline_days": 60
            })
        
        return milestones
    
    def generate_coaching_insights(self, user_data: Dict) -> Dict[str, Any]:
        """
        Generate life coaching insights and recommendations
        """
        goals = user_data.get('goals', [])
        metrics = user_data.get('metrics', [])
        challenges = user_data.get('challenges', [])
        
        insights = {
            "strengths": [],
            "opportunities": [],
            "concerns": [],
            "next_steps": []
        }
        
        # Analyze strengths (high-performing areas)
        if metrics:
            recent_scores = [m.get('productivity_score', 0) for m in metrics[-7:]]
            if np.mean(recent_scores) > 70:
                insights["strengths"].append("You're maintaining high productivity levels")
        
        # Identify opportunities
        incomplete_goals = [g for g in goals if g.get('current_value', 0) < g.get('target_value', 1)]
        if incomplete_goals:
            insights["opportunities"].append(
                f"Focus on {incomplete_goals[0].get('name')} for quick wins"
            )
        
        # Address concerns
        if "procrastination" in challenges:
            insights["concerns"].append("Procrastination patterns detected - consider time-blocking")
        
        # Generate next steps
        insights["next_steps"] = [
            "Review and update your goals weekly",
            "Track your habits daily",
            "Celebrate small wins",
            "Adjust your schedule based on what's working"
        ]
        
        return insights

