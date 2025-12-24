"""
LLM Service for real AI intelligence
Integrates with OpenAI GPT-4 and Anthropic Claude
"""
import os
from typing import Dict, Any, List, Optional
import openai
from openai import OpenAI

class LLMService:
    """Service for interacting with Large Language Models"""
    
    def __init__(self):
        self.openai_client = None
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        
        if self.openai_api_key:
            self.openai_client = OpenAI(api_key=self.openai_api_key)
    
    def analyze_goal(self, goal_text: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Use GPT-4 to analyze a goal and generate strategic questions
        """
        if not self.openai_client:
            return self._fallback_analysis(goal_text, context)
        
        try:
            prompt = f"""You are an expert business strategist and life coach. A user has set this goal: "{goal_text}"

Context:
- Current situation: {context.get('current_value', 'Not specified')}
- Target: {context.get('target_value', 'Not specified')}
- Timeline: {context.get('timeline', 'Not specified')}

Analyze this goal and generate 3-5 strategic questions that will help create an actionable plan. Focus on:
1. Understanding the business/venture type
2. Identifying target market/clientele
3. Current resources and starting point
4. Key milestones and timeline
5. Potential challenges

Return a JSON object with:
- "questions": array of question objects with "question", "field", "required" fields
- "insights": array of initial insights about the goal
- "recommendations": array of high-level strategic recommendations
"""
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert business strategist. Provide structured, actionable advice."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
            )
            
            import json
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            print(f"OpenAI API error: {e}")
            return self._fallback_analysis(goal_text, context)
    
    async def analyze_website(self, website_url: str) -> Dict[str, Any]:
        """
        Analyze a business website using GPT-4 Vision
        """
        if not self.openai_client:
            return {"error": "OpenAI API key not configured"}
        
        try:
            # In production, would fetch website content/images
            # For now, use text analysis
            prompt = f"""Analyze this business website: {website_url}

Extract:
1. Business type and industry
2. Target market/clientele
3. Unique value proposition
4. Services/products offered
5. Competitive positioning
6. Recommendations for improvement

Return JSON with analysis and recommendations.
"""
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a business analyst. Analyze websites and provide insights."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
            )
            
            import json
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            print(f"Website analysis error: {e}")
            return {"error": str(e)}
    
    def generate_strategic_plan(self, goal_data: Dict[str, Any], strategic_focus: List[str], personal_pillars: List[str]) -> Dict[str, Any]:
        """
        Generate comprehensive strategic plan using GPT-4
        """
        if not self.openai_client:
            return self._fallback_strategic_plan(goal_data, strategic_focus, personal_pillars)
        
        try:
            prompt = f"""Create a comprehensive strategic plan for achieving this goal:

Goal: {goal_data.get('name', 'Not specified')}
Current: {goal_data.get('current_value', 0)}
Target: {goal_data.get('target_value', 0)}
Business Type: {goal_data.get('businessType', 'Not specified')}
Target Clientele: {goal_data.get('targetClientele', 'Not specified')}

Strategic Focus Areas: {', '.join(strategic_focus)}
Personal Pillars: {', '.join(personal_pillars)}

Generate:
1. Quarterly milestones (Q1-Q4)
2. Action steps for each quarter
3. Key metrics to track
4. Potential challenges and solutions
5. Resource requirements

Return JSON with structured plan.
"""
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a strategic planning expert. Create detailed, actionable plans."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.8,
            )
            
            import json
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            print(f"Strategic plan generation error: {e}")
            return self._fallback_strategic_plan(goal_data, strategic_focus, personal_pillars)
    
    def generate_goals_from_strategy(self, strategic_focus: List[str], personal_pillars: List[str], challenges: List[str]) -> List[Dict[str, Any]]:
        """
        Generate goals from strategic focus and personal pillars using GPT-4
        """
        if not self.openai_client:
            return self._fallback_goals(strategic_focus, personal_pillars)
        
        try:
            prompt = f"""Based on these inputs, generate 3-5 specific, measurable goals:

Strategic Focus Areas: {', '.join(strategic_focus)}
Personal Pillars: {', '.join(personal_pillars)}
Challenges: {', '.join(challenges)}

For each goal, provide:
- Name (specific and measurable)
- Current value (starting point)
- Target value (where they want to be)
- Category (business, finance, health, learning, family, spiritual)
- Timeline/deadline

Make goals SMART (Specific, Measurable, Achievable, Relevant, Time-bound).

Return JSON with array of goals.
"""
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a goal-setting expert. Create SMART goals based on user's strategic focus."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
            )
            
            import json
            result = json.loads(response.choices[0].message.content)
            return result.get('goals', [])
            
        except Exception as e:
            print(f"Goal generation error: {e}")
            return self._fallback_goals(strategic_focus, personal_pillars)
    
    def generate_coaching_response(self, user_message: str, user_context: Dict[str, Any]) -> str:
        """
        Generate intelligent coaching response using GPT-4
        """
        if not self.openai_client:
            return "I'm here to help! Please configure the AI service to get personalized advice."
        
        try:
            context_str = f"""
User Profile:
- Goals: {len(user_context.get('goals', []))} active goals
- Challenges: {', '.join(user_context.get('challenges', []))}
- Productivity Score: {user_context.get('productivity_score', 'N/A')}
"""
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert life coach and productivity consultant. Provide personalized, actionable advice based on the user's context."},
                    {"role": "user", "content": f"{context_str}\n\nUser question: {user_message}"}
                ],
                temperature=0.8,
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Coaching response error: {e}")
            return "I apologize, but I'm having trouble processing that right now. Please try again."
    
    def _fallback_analysis(self, goal_text: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback when LLM is not available"""
        return {
            "questions": [
                {"question": "What type of business are you building?", "field": "businessType", "required": True},
                {"question": "Who is your target clientele?", "field": "targetClientele", "required": True},
            ],
            "insights": ["This is a significant growth goal that requires strategic planning."],
            "recommendations": ["Break down into quarterly milestones", "Identify key success metrics"]
        }
    
    def _fallback_strategic_plan(self, goal_data: Dict[str, Any], strategic_focus: List[str], personal_pillars: List[str]) -> Dict[str, Any]:
        """Fallback strategic plan"""
        return {
            "quarterly_milestones": [
                {"quarter": "Q1", "target": goal_data.get('target_value', 0) * 0.25, "actions": ["Set foundation", "Build systems"]},
                {"quarter": "Q2", "target": goal_data.get('target_value', 0) * 0.5, "actions": ["Scale operations", "Expand market"]},
            ],
            "key_metrics": ["Revenue", "Customer acquisition", "Market share"],
            "challenges": ["Resource allocation", "Market competition"],
        }
    
    def _fallback_goals(self, strategic_focus: List[str], personal_pillars: List[str]) -> List[Dict[str, Any]]:
        """Fallback goals"""
        goals = []
        if 'business' in strategic_focus or any('business' in s.lower() for s in strategic_focus):
            goals.append({
                "name": "Increase Business Revenue",
                "current_value": 0,
                "target_value": 100000,
                "category": "business",
            })
        if 'finance' in strategic_focus or any('finance' in s.lower() for s in strategic_focus):
            goals.append({
                "name": "Build Financial Security",
                "current_value": 0,
                "target_value": 50000,
                "category": "finance",
            })
        return goals if goals else [{
            "name": "Achieve Strategic Objectives",
            "current_value": 0,
            "target_value": 100,
            "category": "general",
        }]

