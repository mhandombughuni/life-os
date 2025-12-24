// Backend-powered authentication service
import { apiService } from './apiService';

export const backendAuthService = {
  // Sign up new user
  signUp: async (email, password, userData) => {
    try {
      const response = await apiService.register(email, password, userData.name);
      if (response.access_token) {
        apiService.setToken(response.access_token);
      }
      return {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        ...userData,
      };
    } catch (error) {
      throw new Error(error.message || 'Sign up failed');
    }
  },

  // Sign in existing user
  signIn: async (email, password) => {
    try {
      const response = await apiService.login(email, password);
      return response.user;
    } catch (error) {
      throw new Error(error.message || 'Sign in failed');
    }
  },

  // Sign out
  signOut: () => {
    apiService.setToken(null);
  },

  // Get current user (from token)
  getCurrentUser: () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    
    // In production, decode JWT or make API call
    // For now, return from localStorage
    const userStr = localStorage.getItem('strategy_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },
};

