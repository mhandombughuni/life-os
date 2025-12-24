// Proactive AI Service that engages with users and provides intelligent recommendations
import { dataService } from './dataService';
import { apiService } from './apiService';

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

  // Analyze a specific goal and generate questions/recommendations
  analyzeGoal(goal, profile) {
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

  // Analyze business website (if provided)
  async analyzeBusinessWebsite(websiteUrl) {
    try {
      // In production, this would call backend AI service to analyze website
      // For now, return structured analysis
      return {
        businessType: 'Detected from website analysis',
        industry: 'Technology/Services',
        recommendations: [
          'Optimize website for conversions',
          'Improve SEO and online presence',
          'Consider digital marketing strategies',
        ],
      };
    } catch (error) {
      console.error('Website analysis failed:', error);
      return null;
    }
  },

  // Generate strategic recommendations based on collected data
  generateStrategicRecommendations(userId) {
    const goals = dataService.getGoals(userId);
    const profile = dataService.getUserProfile(userId);
    const strategies = [];
    
    goals.forEach(goal => {
      const goalData = goal.aiData || {};
      
      if (goalData.businessType && goalData.targetClientele) {
        strategies.push({
          goalId: goal.id,
          goalName: goal.name,
          strategies: this.generateBusinessStrategies(goalData),
        });
      }
    });
    
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

