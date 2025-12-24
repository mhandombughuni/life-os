import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { dataService } from '../services/dataService';
import { calendarService } from '../services/calendarService';
import { 
  CheckCircle, 
  Circle, 
  Target, 
  Activity, 
  Clock,
  AlertCircle,
  Lightbulb,
  Calendar as CalendarIcon,
  DollarSign,
  TrendingUp,
  MessageCircle,
  User,
  Zap
} from 'lucide-react';
import TodoList from './TodoList';
import ConflictAlert from './ConflictAlert';
import PriorityManager from './PriorityManager';
import GoalStepsDialog from './GoalStepsDialog';
import AIGoalDialogue from './AIGoalDialogue';

const CARD_STYLE = "bg-white p-6 rounded-2xl shadow-sm border border-slate-100";

export default function EnhancedDashboard() {
  const { user, currentDate, updateHabits, getTodayHabits, getInsights, getNudges } = useApp();
  const [habits, setHabits] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [schedule, setSchedule] = useState([]);
  const [goals, setGoals] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(-1);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showAIDialogue, setShowAIDialogue] = useState(false);

  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      updateCurrentActivity();
    }, 60000);
    return () => clearInterval(timer);
  }, [user, currentDate]);

  useEffect(() => {
    updateCurrentActivity();
  }, [schedule, currentTime]);

  const loadData = () => {
    if (!user) return;

    // Load habits - get ALL habits from profile
    const profile = dataService.getUserProfile(user.id);
    const todayHabits = getTodayHabits();
    
    // Get habit definitions
    const allHabits = profile?.habits || [];
    
    // Initialize habits object with all user habits
    const habitsObj = {};
    allHabits.forEach(habit => {
      habitsObj[habit.id] = todayHabits[habit.id] || false;
    });
    setHabits(habitsObj);

    // Load schedule
    const userSchedule = dataService.getSchedule(user.id);
    if (userSchedule && userSchedule.length > 0) {
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
    setGoals(userGoals || []);

    // Load calendar events
    loadCalendarEvents();

    // Check for conflicts
    checkConflicts();
  };

  const loadCalendarEvents = async () => {
    try {
      const events = await calendarService.getEvents(currentDate, currentDate);
      setCalendarEvents(events);
      
      // Merge calendar events with schedule
      const syncedEvents = await calendarService.syncWithSchedule(events);
      setSchedule(prev => [...prev, ...syncedEvents].sort((a, b) => 
        a.time.localeCompare(b.time)
      ));
    } catch (error) {
      console.error('Failed to load calendar events:', error);
    }
  };

  const checkConflicts = () => {
    const detectedConflicts = calendarService.detectConflicts(schedule, calendarEvents);
    setConflicts(detectedConflicts);
  };

  const updateCurrentActivity = () => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    let activeIndex = -1;
    schedule.forEach((slot, index) => {
      const [hours, minutes] = slot.time.split(':').map(Number);
      const slotTimeMinutes = hours * 60 + minutes;
      
      // Check if current time is within 30 minutes of this slot
      if (Math.abs(currentTimeMinutes - slotTimeMinutes) <= 30) {
        activeIndex = index;
      }
    });

    setCurrentActivityIndex(activeIndex);
  };

  const toggleHabit = (key) => {
    const updatedHabits = { ...habits, [key]: !habits[key] };
    setHabits(updatedHabits);
    updateHabits(currentDate, updatedHabits);
  };

  const getHabitDefinitions = () => {
    const profile = user ? dataService.getUserProfile(user.id) : null;
    if (profile && profile.habits && profile.habits.length > 0) {
      return profile.habits;
    }

    // Default habits for executives
    return [
      { id: 'morning_ritual', label: 'Morning Ritual', icon: Activity },
      { id: 'deep_work', label: 'Deep Work Block', icon: Target },
      { id: 'planning', label: 'Daily Planning', icon: CalendarIcon },
      { id: 'exercise', label: 'Exercise/Movement', icon: Activity },
      { id: 'learning', label: 'Learning/Reading', icon: Target },
      { id: 'family_time', label: 'Family Time', icon: User },
      { id: 'evening_review', label: 'Evening Review', icon: Target },
    ];
  };

  const habitDefinitions = getHabitDefinitions();
  const insights = getInsights();
  const nudges = getNudges();
  const productivityScore = insights ? insights.trends.averageScore : 0;

  // Get biggest goal (highest target value)
  const biggestGoal = goals.length > 0 
    ? goals.reduce((max, goal) => 
        (goal.target_value || 0) > (max.target_value || 0) ? goal : max
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name || 'there'}.
          </h2>
          <p className="text-slate-500 mt-1">
            Focus. Structure. Progress.
          </p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-light text-slate-300">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </header>

      {/* Calendar Integration Button */}
      <div className="flex gap-2">
        <button
          onClick={() => calendarService.connectGoogleCalendar()}
          className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium flex items-center gap-2"
        >
          <CalendarIcon className="w-4 h-4" /> Connect Google Calendar
        </button>
        <button
          onClick={() => calendarService.connectAppleCalendar()}
          className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium flex items-center gap-2"
        >
          <CalendarIcon className="w-4 h-4" /> Connect Apple Calendar
        </button>
        <button
          onClick={() => calendarService.connectOutlookCalendar()}
          className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium flex items-center gap-2"
        >
          <CalendarIcon className="w-4 h-4" /> Connect Outlook
        </button>
      </div>

      {/* Conflicts Alert */}
      {conflicts.length > 0 && <ConflictAlert conflicts={conflicts} />}

      {/* Priority Manager */}
      {goals.length > 0 && <PriorityManager goals={goals} todos={dataService.getTodos(user?.id, currentDate) || []} />}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Habits & Score */}
        <div className="space-y-6">
          {/* Productivity Score */}
          <div className={`${CARD_STYLE} border-l-4 border-blue-500`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-600">Productivity Score</h3>
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

          {/* Daily Habits - Show ALL habits */}
          <div className={CARD_STYLE}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" /> Daily Habits
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
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
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span className={isCompleted ? 'line-through opacity-70' : 'font-medium'}>
                          {habit.label}
                        </span>
                      </div>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400" />
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

          {/* To-Do List */}
          <TodoList />
        </div>

        {/* Center: Schedule with Animation */}
        <div className={`${CARD_STYLE} md:col-span-2 flex flex-col`}>
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" /> Today's Schedule
          </h3>
          <div className="flex-1 space-y-6 relative pl-4 border-l-2 border-slate-100">
            {schedule.length > 0 ? (
              schedule.map((slot, i) => {
                const isCurrent = i === currentActivityIndex;
                return (
                  <div key={i} className="relative">
                    {/* Animated Current Activity Dot */}
                    <div className={`absolute -left-[21px] top-1 ${
                      isCurrent ? 'animate-pulse' : ''
                    }`}>
                      <div className={`w-3 h-3 rounded-full border-2 border-white ${
                        slot.type === 'alert' ? 'bg-red-500' : 
                        slot.type === 'health' ? 'bg-green-500' :
                        slot.type === 'work' ? 'bg-blue-500' : 
                        slot.type === 'personal' ? 'bg-purple-500' : 'bg-slate-500'
                      }`} />
                      {/* Orbiting rings for current activity */}
                      {isCurrent && (
                        <>
                          <div className="absolute inset-0 w-3 h-3 rounded-full border-2 border-blue-400 opacity-50 animate-ping" />
                          <div className="absolute inset-0 w-5 h-5 -left-1 -top-1 rounded-full border border-blue-300 opacity-30 animate-pulse" />
                        </>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                      <span className="text-sm font-mono text-slate-400 w-12">{slot.time}</span>
                      <span className={`font-medium ${
                        isCurrent ? 'text-blue-600 font-bold' : 'text-slate-700'
                      }`}>
                        {slot.label}
                        {isCurrent && <span className="ml-2 text-xs text-blue-500">● Now</span>}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-500">Your schedule will appear here</p>
            )}
          </div>
        </div>
      </div>

      {/* Biggest Goals at Bottom - Motivational */}
      {biggestGoal && (
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white rounded-2xl p-6 md:p-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Target className="text-yellow-400" /> Your Biggest Goal
              </h3>
              <p className="text-3xl font-bold text-yellow-400 mb-2">{biggestGoal.name}</p>
              {biggestGoal.target_value && (
                <p className="text-slate-300 text-sm">
                  Target: {typeof biggestGoal.target_value === 'number' && biggestGoal.target_value > 1000
                    ? `$${biggestGoal.target_value.toLocaleString()}`
                    : biggestGoal.target_value}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedGoal(biggestGoal);
                  setShowGoalDialog(true);
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" /> View Steps
              </button>
              <button
                onClick={() => setShowAIDialogue(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" /> AI Coach
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 transition-all duration-1000"
                style={{ width: `${Math.min(((biggestGoal.current_value || 0) / (biggestGoal.target_value || 1)) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-mono mt-2 text-slate-400">
              <span>
                {typeof biggestGoal.current_value === 'number' && biggestGoal.current_value > 1000
                  ? `$${biggestGoal.current_value.toLocaleString()}`
                  : biggestGoal.current_value || 0}
              </span>
              <span>
                {typeof biggestGoal.target_value === 'number' && biggestGoal.target_value > 1000
                  ? `$${biggestGoal.target_value.toLocaleString()}`
                  : biggestGoal.target_value}
              </span>
            </div>
          </div>

          {/* Update Progress Button */}
          <div className="flex gap-3">
            <button 
              onClick={() => {
                const updated = goals.map(g => 
                  g.id === biggestGoal.id 
                    ? { ...g, current_value: (g.current_value || 0) + (g.target_value * 0.01) }
                    : g
                );
                dataService.saveGoals(user.id, updated);
                setGoals(updated);
              }}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              + Update Progress
            </button>
          </div>
        </div>
      )}

      {/* Goal Steps Dialog */}
      {showGoalDialog && selectedGoal && (
        <GoalStepsDialog
          goal={selectedGoal}
          onClose={() => {
            setShowGoalDialog(false);
            setSelectedGoal(null);
          }}
        />
      )}

      {/* AI Dialogue */}
      {showAIDialogue && (
        <AIGoalDialogue
          goals={goals}
          onClose={() => setShowAIDialogue(false)}
        />
      )}
    </div>
  );
}

