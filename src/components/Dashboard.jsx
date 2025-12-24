import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { dataService } from '../services/dataService';
import { metricsService } from '../services/metricsService';
import { 
  CheckCircle, 
  Circle, 
  Target, 
  Activity, 
  TrendingUp,
  TrendingDown,
  Award,
  AlertCircle,
  Lightbulb,
  Calendar,
  Clock,
  BarChart3,
  Zap
} from 'lucide-react';
import MetricsDashboard from './MetricsDashboard';
import NudgesPanel from './NudgesPanel';
import GoalsManager from './GoalsManager';
import Milestones from './Milestones';

const CARD_STYLE = "bg-white p-6 rounded-2xl shadow-sm border border-slate-100";

export default function Dashboard() {
  const { user, currentDate, updateHabits, getTodayHabits, getInsights, getNudges } = useApp();
  const [habits, setHabits] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeView, setActiveView] = useState('today');
  const [schedule, setSchedule] = useState([]);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    // Load today's habits
    const todayHabits = getTodayHabits();
    setHabits(todayHabits);

    // Load user schedule
    if (user) {
      const userSchedule = dataService.getSchedule(user.id);
      if (userSchedule) {
        setSchedule(userSchedule);
      } else {
        // Default schedule
        setSchedule([
          { time: '06:00', label: 'Wake Up & Morning Routine', type: 'personal' },
          { time: '07:00', label: 'Exercise or Movement', type: 'health' },
          { time: '09:00', label: 'Deep Work Session', type: 'work' },
          { time: '12:00', label: 'Lunch Break', type: 'personal' },
          { time: '14:00', label: 'Focused Work', type: 'work' },
          { time: '18:00', label: 'Evening Routine', type: 'personal' },
        ]);
      }

      // Load goals
      const userGoals = dataService.getGoals(user.id);
      setGoals(userGoals);
    }

    // Update clock
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [user, currentDate, getTodayHabits]);

  const toggleHabit = (key) => {
    const updatedHabits = { ...habits, [key]: !habits[key] };
    setHabits(updatedHabits);
    updateHabits(currentDate, updatedHabits);
  };

  const getDayTheme = () => {
    const day = currentTime.getDay();
    const profile = user ? dataService.getUserProfile(user.id) : null;
    
    if (profile && profile.customThemes) {
      return profile.customThemes[day] || `Day ${day + 1}`;
    }

    // Default themes
    const themes = [
      "Rest & Reflection",
      "Strategic Planning",
      "Deep Work",
      "Creative Projects",
      "Networking & Connections",
      "Wrap-up & Review",
      "Family & Adventure"
    ];
    return themes[day];
  };

  const insights = getInsights();
  const nudges = getNudges();
  const productivityScore = insights ? insights.trends.averageScore : 0;

  // Get habit definitions from user profile
  const getHabitDefinitions = () => {
    const profile = user ? dataService.getUserProfile(user.id) : null;
    if (profile && profile.habits) {
      return profile.habits;
    }

    // Default habits based on goals
    const defaultHabits = [];
    if (goals.some(g => g.category === 'health')) {
      defaultHabits.push({ id: 'workout', label: 'Exercise', icon: Activity });
    }
    if (goals.some(g => g.category === 'learning')) {
      defaultHabits.push({ id: 'reading', label: 'Read 20 Pages', icon: Target });
    }
    if (goals.some(g => g.category === 'spiritual')) {
      defaultHabits.push({ id: 'meditation', label: 'Meditation/Prayer', icon: Activity });
    }
    defaultHabits.push({ id: 'planning', label: 'Daily Planning', icon: Calendar });
    
    return defaultHabits;
  };

  const habitDefinitions = getHabitDefinitions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name || 'there'}.
          </h2>
          <p className="text-slate-500 mt-1">
            Today is <span className="font-semibold text-blue-600">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
            </span>.
            Theme: <span className="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-sm font-bold ml-2">
              {getDayTheme()}
            </span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-light text-slate-300">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </header>

      {/* Nudges Panel */}
      {nudges && nudges.length > 0 && <NudgesPanel nudges={nudges} />}

      {/* View Toggle */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-lg w-fit flex-wrap">
        <button
          onClick={() => setActiveView('today')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === 'today'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setActiveView('metrics')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === 'metrics'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveView('goals')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === 'goals'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Goals
        </button>
        <button
          onClick={() => setActiveView('milestones')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === 'milestones'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Milestones
        </button>
      </div>

      {/* Today View */}
      {activeView === 'today' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Habits & Priority */}
          <div className="space-y-6">
            {/* Productivity Score */}
            <div className={`${CARD_STYLE} border-l-4 border-blue-500`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-600">Productivity Score</h3>
                <BarChart3 className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {productivityScore}
                <span className="text-lg text-slate-400">/100</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${productivityScore}%` }}
                />
              </div>
            </div>

            {/* Current Priority */}
            {goals.length > 0 && (
              <div className={`${CARD_STYLE} border-l-4 border-purple-500`}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-500" /> Current Priority
                </h3>
                <div className="bg-purple-50 p-4 rounded-xl text-purple-900 mb-4">
                  <p className="font-medium">{goals[0]?.name || 'Set your goals'}</p>
                  {goals[0]?.deadline && (
                    <p className="text-xs mt-1 text-purple-600">
                      Due {new Date(goals[0].deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Daily Habits */}
            <div className={CARD_STYLE}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" /> Daily Habits
              </h3>
              <div className="space-y-3">
                {habitDefinitions.length > 0 ? (
                  habitDefinitions.map((habit) => {
                    const Icon = habit.icon || Activity;
                    const isCompleted = habits[habit.id] || false;
                    return (
                      <button
                        key={habit.id}
                        onClick={() => toggleHabit(habit.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                          isCompleted
                            ? 'bg-green-50 text-green-800'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span className={isCompleted ? 'line-through opacity-70' : ''}>
                            {habit.label}
                          </span>
                        </div>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Complete onboarding to set up your habits
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Center: Schedule */}
          <div className={`${CARD_STYLE} md:col-span-2 flex flex-col`}>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" /> Today's Schedule
            </h3>
            <div className="flex-1 space-y-6 relative pl-4 border-l-2 border-slate-100">
              {schedule.length > 0 ? (
                schedule.map((slot, i) => (
                  <div key={i} className="relative">
                    <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white ${
                      slot.type === 'alert' ? 'bg-red-500' : 
                      slot.type === 'health' ? 'bg-green-500' :
                      slot.type === 'work' ? 'bg-blue-500' : 'bg-purple-500'
                    }`} />
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                      <span className="text-sm font-mono text-slate-400 w-12">{slot.time}</span>
                      <span className="font-medium text-slate-700">{slot.label}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Your schedule will appear here</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Metrics View */}
      {activeView === 'metrics' && insights && (
        <MetricsDashboard insights={insights} userId={user?.id} />
      )}

      {/* Goals View */}
      {activeView === 'goals' && (
        <GoalsManager />
      )}

      {/* Milestones View */}
      {activeView === 'milestones' && (
        <Milestones />
      )}

      {/* Goals Summary (shown on Today view) */}
      {activeView === 'today' && goals.length > 0 && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="text-yellow-400" /> Your Goals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal, index) => (
              <div key={index} className="bg-white/10 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{goal.name}</h4>
                  <span className="text-xs text-slate-400">
                    {Math.round((goal.current / goal.target) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{goal.current}</span>
                  <span>{goal.target}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

