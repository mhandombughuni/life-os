// Productivity metrics and scoring service
import { dataService } from './dataService';

export const metricsService = {
  // Calculate daily productivity score
  calculateDailyScore: (habits, goals, scheduleCompletion) => {
    if (!habits) return 0;

    const habitCount = Object.keys(habits).length;
    const completedHabits = Object.values(habits).filter(Boolean).length;
    const habitScore = habitCount > 0 ? (completedHabits / habitCount) * 50 : 0;
    
    const scheduleScore = scheduleCompletion * 30;
    const goalProgressScore = goals.reduce((acc, goal) => {
      const progress = goal.current / goal.target;
      return acc + (progress * 20 / goals.length);
    }, 0);

    return Math.round(habitScore + scheduleScore + goalProgressScore);
  },

  // Calculate streak for a habit
  calculateStreak: (userId, habitKey, history) => {
    if (!history || history.length === 0) return 0;

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    // Check today first
    const todayData = history.find(h => h.date === today);
    if (todayData && todayData.habits && todayData.habits[habitKey]) {
      streak = 1;
    } else {
      return 0; // No streak if today is not completed
    }

    // Count backwards
    for (let i = 1; i < history.length; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = history.find(h => h.date === dateStr);
      
      if (dayData && dayData.habits && dayData.habits[habitKey]) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  },

  // Get insights (what went well, what to improve)
  generateInsights: (userId, days = 7) => {
    const history = dataService.getHabitHistory(userId, days);
    const metricsHistory = dataService.getMetricsHistory(userId, days);
    
    if (history.length === 0) {
      return {
        strengths: [],
        improvements: [],
        trends: [],
      };
    }

    // Analyze habit completion rates
    const habitStats = {};
    history.forEach(day => {
      if (day.habits) {
        Object.keys(day.habits).forEach(habitKey => {
          if (!habitStats[habitKey]) {
            habitStats[habitKey] = { completed: 0, total: 0 };
          }
          habitStats[habitKey].total++;
          if (day.habits[habitKey]) {
            habitStats[habitKey].completed++;
          }
        });
      }
    });

    // Find strengths (habits with >70% completion)
    const strengths = Object.entries(habitStats)
      .filter(([_, stats]) => stats.total > 0 && (stats.completed / stats.total) > 0.7)
      .map(([habitKey, stats]) => ({
        habit: habitKey,
        completionRate: Math.round((stats.completed / stats.total) * 100),
      }))
      .sort((a, b) => b.completionRate - a.completionRate);

    // Find improvements (habits with <50% completion)
    const improvements = Object.entries(habitStats)
      .filter(([_, stats]) => stats.total > 0 && (stats.completed / stats.total) < 0.5)
      .map(([habitKey, stats]) => ({
        habit: habitKey,
        completionRate: Math.round((stats.completed / stats.total) * 100),
      }))
      .sort((a, b) => a.completionRate - b.completionRate);

    // Calculate trend (improving or declining)
    const scores = metricsHistory.map(m => m.score || 0);
    const trend = scores.length >= 2 
      ? (scores[0] > scores[scores.length - 1] ? 'improving' : 'declining')
      : 'stable';

    return {
      strengths,
      improvements,
      trends: {
        direction: trend,
        averageScore: scores.length > 0 
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0,
        bestDay: metricsHistory.length > 0
          ? metricsHistory.reduce((best, current) => 
              (current.score || 0) > (best.score || 0) ? current : best
            )
          : null,
      },
    };
  },

  // Get productivity score for a date range
  getProductivityScore: (userId, days = 7) => {
    const metricsHistory = dataService.getMetricsHistory(userId, days);
    if (metricsHistory.length === 0) return 0;

    const scores = metricsHistory.map(m => m.score || 0);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  },
};

