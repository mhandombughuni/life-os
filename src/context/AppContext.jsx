import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { dataService } from '../services/dataService';
import { metricsService } from '../services/metricsService';
import { aiService } from '../services/aiService';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      const profile = dataService.getUserProfile(currentUser.id);
      setOnboardingComplete(!!profile);
    }
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    const userData = await authService.signIn(email, password);
    setUser(userData);
    const profile = dataService.getUserProfile(userData.id);
    setOnboardingComplete(!!profile);
    return userData;
  };

  const signUp = async (email, password, userData) => {
    const newUser = await authService.signUp(email, password, userData);
    setUser(newUser);
    return newUser;
  };

  const signOut = () => {
    authService.signOut();
    setUser(null);
    setOnboardingComplete(false);
  };

  const completeOnboarding = (profileData) => {
    if (!user) return;
    
    dataService.saveUserProfile(user.id, {
      ...profileData,
      completedAt: new Date().toISOString(),
    });
    
    // Initialize default habits based on user goals
    const defaultHabits = {};
    if (profileData.goals?.includes('health')) {
      defaultHabits.workout = false;
    }
    if (profileData.goals?.includes('learning')) {
      defaultHabits.reading = false;
    }
    if (profileData.goals?.includes('spiritual')) {
      defaultHabits.meditation = false;
    }
    
    dataService.saveHabits(user.id, currentDate, defaultHabits);
    
    setOnboardingComplete(true);
  };

  const updateHabits = (date, habits) => {
    if (!user) return;
    dataService.saveHabits(user.id, date, habits);
    
    // Calculate and save metrics
    const goals = dataService.getGoals(user.id);
    const score = metricsService.calculateDailyScore(habits, goals, 0.8);
    dataService.saveDailyMetrics(user.id, date, { score, habits });
    
    // Learn from behavior
    aiService.learnPreferences(user.id);
  };

  const getTodayHabits = () => {
    if (!user) return {};
    return dataService.getHabits(user.id, currentDate) || {};
  };

  const getInsights = () => {
    if (!user) return null;
    return metricsService.generateInsights(user.id, 7);
  };

  const getNudges = () => {
    if (!user) return [];
    return aiService.generateNudges(user.id);
  };

  const value = {
    user,
    loading,
    onboardingComplete,
    currentDate,
    signIn,
    signUp,
    signOut,
    completeOnboarding,
    updateHabits,
    getTodayHabits,
    getInsights,
    getNudges,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

