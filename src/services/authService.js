// Authentication service using localStorage (can be upgraded to Firebase/Supabase)
const STORAGE_KEY = 'strategy_user';
const SESSION_KEY = 'strategy_session';

export const authService = {
  // Sign up new user
  signUp: async (email, password, userData) => {
    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem('strategy_users') || '[]');
    if (existingUsers.find(u => u.email === email)) {
      throw new Error('User already exists');
    }

    const user = {
      id: Date.now().toString(),
      email,
      password: btoa(password), // Simple encoding (in production, use proper hashing)
      ...userData,
      createdAt: new Date().toISOString(),
    };

    existingUsers.push(user);
    localStorage.setItem('strategy_users', JSON.stringify(existingUsers));
    
    // Auto-login after signup
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, email: user.email }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    
    return user;
  },

  // Sign in existing user
  signIn: async (email, password) => {
    const users = JSON.parse(localStorage.getItem('strategy_users') || '[]');
    const user = users.find(u => u.email === email);
    
    if (!user || atob(user.password) !== password) {
      throw new Error('Invalid email or password');
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, email: user.email }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    
    return user;
  },

  // Sign out
  signOut: () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(STORAGE_KEY);
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem(STORAGE_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem(SESSION_KEY);
  },

  // Update user data
  updateUser: (updates) => {
    const user = authService.getCurrentUser();
    if (!user) return null;

    const users = JSON.parse(localStorage.getItem('strategy_users') || '[]');
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem('strategy_users', JSON.stringify(users));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users[userIndex]));
      return users[userIndex];
    }
    return null;
  },
};

