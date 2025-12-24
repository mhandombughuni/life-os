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
import CalendarIntegration from './CalendarIntegration';
import FloatingAICoach from './FloatingAICoach';
import GoalGroups from './GoalGroups';

const CARD_STYLE = "bg-white p-6 rounded-2xl shadow-md border border-slate-200 hover:shadow-lg transition-shadow";

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
      }, 1000); // Update every second for smooth animation
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
      
      // Check if current time is within this slot's time range
      const nextSlot = schedule[index + 1];
      if (nextSlot) {
        const [nextHours, nextMins] = nextSlot.time.split(':').map(Number);
        const nextSlotTimeMinutes = nextHours * 60 + nextMins;
        
        // Current time is between this slot and next slot
        if (currentTimeMinutes >= slotTimeMinutes && currentTimeMinutes < nextSlotTimeMinutes) {
          activeIndex = index;
        }
      } else {
        // Last slot of the day - check if we're past its start time
        if (currentTimeMinutes >= slotTimeMinutes) {
          activeIndex = index;
        }
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
    <div className="space-y-6 pb-20">
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

      {/* Calendar Integration */}
      <CalendarIntegration />

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
          <div className="w-full">
            <TodoList />
          </div>
        </div>

        {/* Center: Schedule with Animation */}
        <div className={`${CARD_STYLE} md:col-span-2 flex flex-col`}>
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" /> Today's Schedule
          </h3>
          <div className="flex-1 space-y-6 relative pl-4">
            
            {/* Border Line */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-200" />
            
            {schedule.length > 0 ? (
              schedule.map((slot, i) => {
                const isCurrent = i === currentActivityIndex;
                const isPast = i < currentActivityIndex;
                const isNext = i === currentActivityIndex + 1;
                
                // Calculate progress percentage if current
                let progressPercent = 0;
                if (isCurrent) {
                  const [currentHours, currentMins] = slot.time.split(':').map(Number);
                  const currentSlotTime = new Date();
                  currentSlotTime.setHours(currentHours, currentMins, 0, 0);
                  
                  const nextSlot = schedule[i + 1];
                  if (nextSlot) {
                    const [nextHours, nextMins] = nextSlot.time.split(':').map(Number);
                    const nextSlotTime = new Date();
                    nextSlotTime.setHours(nextHours, nextMins, 0, 0);
                    
                    const now = currentTime;
                    const totalDuration = nextSlotTime - currentSlotTime;
                    const elapsed = now - currentSlotTime;
                    progressPercent = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
                  }
                }
                
                return (
                  <div key={i} className="relative">
                    {/* Animated Current Activity Dot */}
                    <div className="absolute -left-[21px] top-1">
                      {isCurrent ? (
                        <div className="relative">
                          {/* Main pulsing dot */}
                          <div className={`w-3 h-3 rounded-full border-2 border-white current-activity-dot ${
                            slot.type === 'alert' ? 'bg-red-500' : 
                            slot.type === 'health' ? 'bg-green-500' :
                            slot.type === 'work' ? 'bg-blue-500' : 
                            slot.type === 'personal' ? 'bg-purple-500' : 'bg-slate-500'
                          }`} />
                          {/* Pulsing ring */}
                          <div className={`absolute inset-0 w-3 h-3 rounded-full border-2 current-activity-ring ${
                            slot.type === 'work' ? 'border-blue-400' : 
                            slot.type === 'health' ? 'border-green-400' :
                            slot.type === 'personal' ? 'border-purple-400' : 'border-slate-400'
                          }`} />
                          {/* Orbiting ring */}
                          <div className={`absolute inset-0 w-5 h-5 -left-1 -top-1 rounded-full border current-activity-orbit ${
                            slot.type === 'work' ? 'border-blue-300' : 
                            slot.type === 'health' ? 'border-green-300' :
                            slot.type === 'personal' ? 'border-purple-300' : 'border-slate-300'
                          }`} />
                        </div>
                      ) : (
                        <div className={`w-3 h-3 rounded-full border-2 border-white ${
                          isPast ? 'bg-slate-400' :
                          slot.type === 'alert' ? 'bg-red-500' : 
                          slot.type === 'health' ? 'bg-green-500' :
                          slot.type === 'work' ? 'bg-blue-500' : 
                          slot.type === 'personal' ? 'bg-purple-500' : 'bg-slate-500'
                        }`} />
                      )}
                    </div>
                    
                    {/* Progress line to next activity */}
                    {isCurrent && schedule[i + 1] && (
                      <div className="absolute -left-[18px] top-4 w-0.5 h-20 bg-slate-200 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-b from-blue-500 via-blue-400 to-blue-300 transition-all duration-1000 ease-linear"
                          style={{ 
                            height: `${Math.min(progressPercent, 100)}%`,
                            boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)',
                          }}
                        />
                        {/* Animated shimmer effect */}
                        <div 
                          className="absolute top-0 left-0 right-0 h-2 bg-white opacity-30 animate-pulse"
                          style={{ 
                            transform: `translateY(${progressPercent}%)`,
                            transition: 'transform 1s linear',
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                      <span className="text-sm font-mono text-slate-400 w-12">{slot.time}</span>
                      <span className={`font-medium ${
                        isCurrent ? 'text-blue-600 font-bold' : 
                        isPast ? 'text-slate-400 line-through' : 
                        'text-slate-700'
                      }`}>
                        {slot.label}
                        {isCurrent && <span className="ml-2 text-xs text-blue-500 animate-pulse">● Now</span>}
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

      {/* Goal Groups at Bottom */}
      <GoalGroups />

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

      {/* Floating AI Coach */}
      <FloatingAICoach />
    </div>
  );
}

