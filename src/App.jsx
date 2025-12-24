import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import Dashboard from './components/EnhancedDashboard';
import Strategy from './components/Strategy';
import { Activity, LogOut } from 'lucide-react';

function AppContent() {
  const { user, loading, onboardingComplete, signOut } = useApp();
  const [localActiveTab, setLocalActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (!onboardingComplete) {
    return <Onboarding />;
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      {/* Navigation Bar */}
      <nav className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="text-blue-400" />
            <h1 className="text-xl font-bold tracking-tight">Kocha 360°</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-4 text-sm">
              <button 
                onClick={() => setLocalActiveTab('dashboard')} 
                className={`${localActiveTab === 'dashboard' ? 'text-blue-400' : 'text-slate-400'} hover:text-white transition-colors`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setLocalActiveTab('strategy')} 
                className={`${localActiveTab === 'strategy' ? 'text-blue-400' : 'text-slate-400'} hover:text-white transition-colors`}
              >
                Strategy
              </button>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">{user.name || user.email}</span>
              <button
                onClick={signOut}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        {localActiveTab === 'dashboard' && <Dashboard />}
        {localActiveTab === 'strategy' && <Strategy />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
