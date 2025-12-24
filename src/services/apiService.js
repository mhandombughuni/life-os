// API service for connecting to Python backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(email, password, name) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    return data;
  }

  async login(email, password) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  // User endpoints
  async getUser(userId) {
    return this.request(`/api/users/${userId}`);
  }

  async updateProfile(userId, profileData) {
    return this.request(`/api/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async completeOnboarding(userId) {
    return this.request(`/api/users/${userId}/onboarding-complete`, {
      method: 'POST',
    });
  }

  // Habit endpoints
  async updateHabits(userId, date, habits) {
    const params = new URLSearchParams({ user_id: userId });
    return this.request(`/api/habits/batch-update?${params}`, {
      method: 'POST',
      body: JSON.stringify({
        habits,
        date,
      }),
    });
  }

  async getHabitHistory(userId, days = 30) {
    return this.request(`/api/habits/history?user_id=${userId}&days=${days}`);
  }

  // Goal endpoints
  async getGoals(userId) {
    return this.request(`/api/goals/?user_id=${userId}`);
  }

  async createGoal(userId, goalData) {
    return this.request('/api/goals/', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        ...goalData,
      }),
    });
  }

  async updateGoal(userId, goalId, goalData) {
    return this.request(`/api/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify({
        user_id: userId,
        ...goalData,
      }),
    });
  }

  async deleteGoal(userId, goalId) {
    return this.request(`/api/goals/${goalId}?user_id=${userId}`, {
      method: 'DELETE',
    });
  }

  // Analytics endpoints
  async saveMetrics(userId, date, metrics) {
    const params = new URLSearchParams({ user_id: userId });
    return this.request(`/api/analytics/metrics?${params}`, {
      method: 'POST',
      body: JSON.stringify({
        date,
        ...metrics,
      }),
    });
  }

  async getInsights(userId, days = 7) {
    return this.request(`/api/analytics/insights?user_id=${userId}&days=${days}`);
  }

  // AI endpoints
  async getRecommendations(userId, context = {}) {
    return this.request('/api/ai/recommendations', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        context,
      }),
    });
  }

  async getCoachingAdvice(userId, focusArea = null) {
    return this.request('/api/coaching/plan', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        focus_area: focusArea,
      }),
    });
  }

  async analyzeBehavior(userId) {
    return this.request('/api/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
      }),
    });
  }
}

export const apiService = new ApiService();

