// Data service for storing user progress, habits, metrics, etc.
const getStorageKey = (userId, key) => `strategy_${userId}_${key}`;

export const dataService = {
  // User preferences and profile
  saveUserProfile: (userId, profile) => {
    localStorage.setItem(getStorageKey(userId, 'profile'), JSON.stringify(profile));
  },

  getUserProfile: (userId) => {
    const data = localStorage.getItem(getStorageKey(userId, 'profile'));
    return data ? JSON.parse(data) : null;
  },

  // Daily habits tracking
  saveHabits: (userId, date, habits) => {
    const key = getStorageKey(userId, `habits_${date}`);
    localStorage.setItem(key, JSON.stringify(habits));
  },

  getHabits: (userId, date) => {
    const key = getStorageKey(userId, `habits_${date}`);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  // Get all habit history
  getHabitHistory: (userId, days = 30) => {
    const history = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const habits = dataService.getHabits(userId, dateStr);
      if (habits) {
        history.push({ date: dateStr, habits });
      }
    }
    
    return history;
  },

  // Goals tracking
  saveGoals: (userId, goals) => {
    localStorage.setItem(getStorageKey(userId, 'goals'), JSON.stringify(goals));
  },

  getGoals: (userId) => {
    const data = localStorage.getItem(getStorageKey(userId, 'goals'));
    return data ? JSON.parse(data) : [];
  },

  // Metrics and scores
  saveDailyMetrics: (userId, date, metrics) => {
    const key = getStorageKey(userId, `metrics_${date}`);
    localStorage.setItem(key, JSON.stringify({
      ...metrics,
      date,
      timestamp: new Date().toISOString(),
    }));
  },

  getDailyMetrics: (userId, date) => {
    const key = getStorageKey(userId, `metrics_${date}`);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  // Get metrics history
  getMetricsHistory: (userId, days = 30) => {
    const history = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const metrics = dataService.getDailyMetrics(userId, dateStr);
      if (metrics) {
        history.push(metrics);
      }
    }
    
    return history;
  },

  // Milestones
  saveMilestones: (userId, milestones) => {
    localStorage.setItem(getStorageKey(userId, 'milestones'), JSON.stringify(milestones));
  },

  getMilestones: (userId) => {
    const data = localStorage.getItem(getStorageKey(userId, 'milestones'));
    return data ? JSON.parse(data) : [];
  },

  // Schedule and themes
  saveSchedule: (userId, schedule) => {
    localStorage.setItem(getStorageKey(userId, 'schedule'), JSON.stringify(schedule));
  },

  getSchedule: (userId) => {
    const data = localStorage.getItem(getStorageKey(userId, 'schedule'));
    return data ? JSON.parse(data) : null;
  },

  // User preferences (AI learning)
  savePreferences: (userId, preferences) => {
    localStorage.setItem(getStorageKey(userId, 'preferences'), JSON.stringify(preferences));
  },

  getPreferences: (userId) => {
    const data = localStorage.getItem(getStorageKey(userId, 'preferences'));
    return data ? JSON.parse(data) : {
      preferredWorkTimes: [],
      productivityPatterns: {},
      habitStrengths: {},
      challengeAreas: [],
    };
  },
};

