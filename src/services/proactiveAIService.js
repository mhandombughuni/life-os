// Proactive AI Service that engages with users and provides intelligent recommendations
import { dataService } from './dataService';
import { apiService } from './apiService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const proactiveAIService = {
  // Analyze user's goals and trigger proactive engagement
  analyzeAndEngage(userId, newGoal = null) {
    const goals = dataService.getGoals(userId);
    const profile = dataService.getUserProfile(userId);
    
    // Check if there's a new goal that needs analysis
    if (newGoal) {
      return this.analyzeGoal(newGoal, profile);
    }
    
    // Check for goals that need follow-up
    const goalsNeedingFollowUp = goals.filter(g => !g.aiAnalyzed);
    if (goalsNeedingFollowUp.length > 0) {
      return this.analyzeGoal(goalsNeedingFollowUp[0], profile);
    }
    
    return null;
  },

  // Analyze a specific goal and generate questions/recommendations using LLM
  async analyzeGoal(goal, profile) {
    // Call backend LLM service
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/analyze-goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal_text: goal.name,
          user_id: profile?.userId,
          context: {
            current_value: goal.current_value || 0,
            target_value: goal.target_value || 0,
            timeline: goal.deadline || 'Not specified',
          },
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          needsEngagement: (data.questions || []).length > 0,
          questions: data.questions || [],
          recommendations: data.recommendations || [],
          insights: data.insights || [],
          goalId: goal.id,
        };
      }
    } catch (error) {
      console.error('LLM analysis failed, using fallback:', error);
    }
    
    // Fallback to rule-based analysis
    return this._fallbackAnalyzeGoal(goal, profile);
  },

  _fallbackAnalyzeGoal(goal, profile) {
    const goalText = goal.name.toLowerCase();
    const questions = [];
    const recommendations = [];
    
    // Detect business/revenue goals
    if (goalText.includes('million') || goalText.includes('revenue') || goalText.includes('company') || goalText.includes('business') || goalText.includes('$')) {
      questions.push({
        type: 'business',
        question: "What type of business are you building?",
        field: 'businessType',
        required: true,
      });
      
      questions.push({
        type: 'business',
        question: "Who is your target clientele/customer base?",
        field: 'targetClientele',
        required: true,
      });
      
      questions.push({
        type: 'business',
        question: "Do you have a business website? (If yes, please share the URL)",
        field: 'businessWebsite',
        required: false,
      });
      
      questions.push({
        type: 'business',
        question: "What's your current revenue/starting point?",
        field: 'currentRevenue',
        required: true,
      });
      
      questions.push({
        type: 'business',
        question: "What's your target timeline?",
        field: 'timeline',
        required: true,
      });
    }
    
    // Generate recommendations based on goal analysis
    if (goalText.includes('12 million') || goalText.includes('$12')) {
      recommendations.push({
        type: 'strategy',
        title: 'Scale Strategy for $12M Company',
        description: 'To reach $12M from $2M, you need 6x growth. This requires:',
        steps: [
          '1. Identify your highest-margin products/services',
          '2. Build scalable systems and processes',
          '3. Expand to new markets or customer segments',
          '4. Consider strategic partnerships or acquisitions',
          '5. Invest in marketing and sales infrastructure',
        ],
        priority: 'high',
      });
    }
    
    return {
      needsEngagement: questions.length > 0,
      questions,
      recommendations,
      goalId: goal.id,
    };
  },

  // Analyze business website (if provided) using GPT-4 Vision
  async analyzeBusinessWebsite(websiteUrl) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/analyze-website`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website_url: websiteUrl,
          user_id: JSON.parse(localStorage.getItem('strategy_user'))?.id,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error('Website analysis failed:', error);
    }
    return null;
  },

  // Generate strategic recommendations based on collected data using LLM
  async generateStrategicRecommendations(userId) {
    if (!userId) return [];
    const goals = dataService.getGoals(userId);
    const profile = dataService.getUserProfile(userId);
    const strategies = [];
    
    // Use LLM for each goal that has AI data
    for (const goal of goals) {
      const goalData = goal.aiData || {};
      
      if (goalData.businessType && goalData.targetClientele) {
        try {
          // Call backend LLM service for strategic plan
          const response = await fetch(`${API_BASE_URL}/api/ai/strategic-plan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              goal_data: {
                name: goal.name,
                current_value: goal.current_value,
                target_value: goal.target_value,
                businessType: goalData.businessType,
                targetClientele: goalData.targetClientele,
              },
              strategic_focus: profile?.strategies?.map(s => s.title) || [],
              personal_pillars: profile?.pillars?.map(p => p.name) || [],
            }),
          });
          
          if (response.ok) {
            const plan = await response.json();
            strategies.push({
              goalId: goal.id,
              goalName: goal.name,
              strategies: plan.strategies || this.generateBusinessStrategies(goalData),
            });
          } else {
            // Fallback
            strategies.push({
              goalId: goal.id,
              goalName: goal.name,
              strategies: this.generateBusinessStrategies(goalData),
            });
          }
        } catch (error) {
          console.error('LLM strategic plan failed:', error);
          strategies.push({
            goalId: goal.id,
            goalName: goal.name,
            strategies: this.generateBusinessStrategies(goalData),
          });
        }
      }
    }
    
    return strategies;
  },

  // Generate business-specific strategies
  generateBusinessStrategies(businessData) {
    const strategies = [];
    
    if (businessData.businessType) {
      strategies.push({
        title: `Market Positioning for ${businessData.businessType}`,
        description: `Position your ${businessData.businessType} business to attract ${businessData.targetClientele}`,
        actions: [
          'Research competitor positioning',
          'Define unique value proposition',
          'Develop targeted marketing messages',
        ],
      });
    }
    
    if (businessData.targetClientele) {
      strategies.push({
        title: `Customer Acquisition Strategy`,
        description: `Focus on acquiring ${businessData.targetClientele} customers`,
        actions: [
          'Identify where your customers spend time',
          'Create content that resonates with them',
          'Build partnerships in their ecosystem',
        ],
      });
    }
    
    return strategies;
  },

  // Save AI analysis data to goal
  saveGoalAnalysis(userId, goalId, analysisData) {
    const goals = dataService.getGoals(userId);
    const updated = goals.map(g => 
      g.id === goalId 
        ? { ...g, aiData: analysisData, aiAnalyzed: true }
        : g
    );
    dataService.saveGoals(userId, updated);
  },
};

