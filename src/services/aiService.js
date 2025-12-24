// AI service for learning preferences and generating nudges
import { dataService } from './dataService';
import { metricsService } from './metricsService';

export const aiService = {
  // Learn from user behavior patterns
  learnPreferences: (userId) => {
    const history = dataService.getHabitHistory(userId, 30);
    const metricsHistory = dataService.getMetricsHistory(userId, 30);
    const preferences = dataService.getPreferences(userId);

    // Analyze when user is most productive
    const timePatterns = {};
    metricsHistory.forEach(metric => {
      if (metric.bestTime) {
        timePatterns[metric.bestTime] = (timePatterns[metric.bestTime] || 0) + 1;
      }
    });

    // Find most productive time
    const bestTime = Object.entries(timePatterns)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'morning';

    // Analyze habit strengths
    const habitStrengths = {};
    history.forEach(day => {
      if (day.habits) {
        Object.keys(day.habits).forEach(habitKey => {
          if (!habitStrengths[habitKey]) {
            habitStrengths[habitKey] = { completed: 0, total: 0 };
          }
          habitStrengths[habitKey].total++;
          if (day.habits[habitKey]) {
            habitStrengths[habitKey].completed++;
          }
        });
      }
    });

    // Update preferences
    const updatedPreferences = {
      ...preferences,
      preferredWorkTimes: [bestTime],
      habitStrengths: Object.fromEntries(
        Object.entries(habitStrengths).map(([key, stats]) => [
          key,
          stats.total > 0 ? stats.completed / stats.total : 0
        ])
      ),
      lastUpdated: new Date().toISOString(),
    };

    dataService.savePreferences(userId, updatedPreferences);
    return updatedPreferences;
  },

  // Generate behavioral science nudges
  generateNudges: (userId) => {
    const preferences = dataService.getPreferences(userId);
    const insights = metricsService.generateInsights(userId, 7);
    const today = new Date();
    const dayOfWeek = today.getDay();
    const currentHour = today.getHours();

    const nudges = [];

    // Nudge based on time of day
    if (currentHour >= 6 && currentHour < 9) {
      nudges.push({
        type: 'morning',
        message: 'Start your day strong! Complete your morning habits to build momentum.',
        priority: 'high',
      });
    }

    // Nudge based on weak habits
    if (insights.improvements.length > 0) {
      const weakestHabit = insights.improvements[0];
      nudges.push({
        type: 'improvement',
        message: `Focus on "${weakestHabit.habit}" today. Small consistent actions lead to big changes.`,
        priority: 'medium',
        habit: weakestHabit.habit,
      });
    }

    // Nudge based on streaks
    const history = dataService.getHabitHistory(userId, 7);
    Object.keys(history[0]?.habits || {}).forEach(habitKey => {
      const streak = metricsService.calculateStreak(userId, habitKey, history);
      if (streak >= 3 && streak < 7) {
        nudges.push({
          type: 'streak',
          message: `You're on a ${streak}-day streak with "${habitKey}"! Keep it going! 🔥`,
          priority: 'high',
          habit: habitKey,
          streak,
        });
      }
    });

    // Nudge based on productivity patterns
    if (preferences.preferredWorkTimes.length > 0) {
      const bestTime = preferences.preferredWorkTimes[0];
      if (bestTime === 'morning' && currentHour >= 9 && currentHour < 12) {
        nudges.push({
          type: 'optimal-time',
          message: "You're most productive in the morning. Tackle your most important tasks now!",
          priority: 'high',
        });
      }
    }

    // Social proof nudge
    if (insights.trends.direction === 'improving') {
      nudges.push({
        type: 'encouragement',
        message: `Your productivity is trending up! You've improved by ${Math.abs(insights.trends.averageScore - 50)}% this week.`,
        priority: 'low',
      });
    }

    return nudges.slice(0, 3); // Return top 3 nudges
  },

  // Generate personalized schedule recommendations
  generateScheduleRecommendations: (userId) => {
    const preferences = dataService.getPreferences(userId);
    const profile = dataService.getUserProfile(userId);
    const insights = metricsService.generateInsights(userId, 14);

    if (!profile) return null;

    // Base schedule on user's goals and challenges
    const recommendations = {
      morning: [],
      afternoon: [],
      evening: [],
    };

    // Add habits based on strengths (maintain momentum)
    insights.strengths.slice(0, 2).forEach(strength => {
      recommendations.morning.push({
        time: '06:30',
        activity: `Complete: ${strength.habit}`,
        type: 'habit',
        priority: 'high',
      });
    });

    // Add improvement areas (build new habits)
    insights.improvements.slice(0, 1).forEach(improvement => {
      recommendations.morning.push({
        time: '07:00',
        activity: `Focus on: ${improvement.habit}`,
        type: 'improvement',
        priority: 'medium',
      });
    });

    // Add goal-related activities
    const goals = dataService.getGoals(userId);
    goals.slice(0, 2).forEach(goal => {
      recommendations.afternoon.push({
        time: '14:00',
        activity: `Work on: ${goal.name}`,
        type: 'goal',
        priority: 'high',
      });
    });

    return recommendations;
  },
};

