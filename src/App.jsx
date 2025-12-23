import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Briefcase, 
  BookOpen, 
  Heart, 
  Activity, 
  Radio, 
  Mic, 
  DollarSign, 
  Target,
  Menu,
  X,
  Tv
} from 'lucide-react';

// Simplified Tailwind classes for clarity
const CARD_STYLE = "bg-white p-6 rounded-2xl shadow-sm border border-slate-100";
const BUTTON_STYLE = "px-4 py-2 rounded-lg font-medium transition-colors";

export default function LifeOS() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Goals State
  const [revenue, setRevenue] = useState(150000); // Current estimated revenue
  const revenueGoal = 1000000;
  
  // Habits State (Daily Reset)
  const [habits, setHabits] = useState({
    workout: false,
    french: false,
    bible: false,
    reading: false,
    networking: false
  });

  // Clock Update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const toggleHabit = (key) => {
    setHabits(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getDayTheme = () => {
    const day = currentTime.getDay();
    const themes = [
      "The Pastor (Ministry & Planning)", // Sunday
      "The CEO (Strategy & Sales)",       // Monday
      "The Scholar (PhD Coursework)",    // Tuesday
      "The Maker (Product & Media)",      // Wednesday
      "The Connector (Networking)",       // Thursday
      "The Closer (Admin & Wrap-up)",     // Friday
      "The Father (Family & Adventure)"   // Saturday
    ];
    return themes[day];
  };

  const getProgressColor = (current, total) => {
    const percentage = (current / total) * 100;
    if (percentage < 30) return 'bg-red-500';
    if (percentage < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Navigation Bar */}
      <nav className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="text-blue-400" />
            <h1 className="text-xl font-bold tracking-tight">Mhando's Life OS</h1>
          </div>
          <div className="flex gap-4 text-sm">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`${activeTab === 'dashboard' ? 'text-blue-400' : 'text-slate-400'} hover:text-white`}
            >
              Command Center
            </button>
            <button 
              onClick={() => setActiveTab('strategy')} 
              className={`${activeTab === 'strategy' ? 'text-blue-400' : 'text-slate-400'} hover:text-white`}
            >
              Handos Strategy
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* === DASHBOARD VIEW === */}
        {activeTab === 'dashboard' && (
          <>
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'}, Mhando.
                </h2>
                <p className="text-slate-500 mt-1">
                  Today is <span className="font-semibold text-blue-600">{currentTime.toLocaleDateString('en-US', { weekday: 'long' })}</span>.
                  Your theme is: <span className="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-sm font-bold ml-2">{getDayTheme()}</span>
                </p>
              </div>
              <div className="text-right hidden md:block">
                <div className="text-4xl font-light text-slate-300">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Col: Priority & Habits */}
              <div className="space-y-6">
                <div className={`${CARD_STYLE} border-l-4 border-blue-500`}>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" /> Current Priority
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-xl text-blue-900 mb-4">
                    <p className="font-medium">Close 2 Government Leads</p>
                    <p className="text-xs mt-1 text-blue-600">Q1 Goal • Due March 30</p>
                  </div>
                  <p className="text-sm text-slate-500">
                    Stop wandering. If you aren't doing deep work, spending time with family, or resting... you are drifting.
                  </p>
                </div>

                <div className={CARD_STYLE}>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-500" /> Daily Non-Negotiables
                  </h3>
                  <div className="space-y-3">
                    {[
                      { id: 'bible', label: 'Bible & Prayer', icon: BookOpen },
                      { id: 'workout', label: 'Workout (Run/Lift)', icon: Heart },
                      { id: 'french', label: 'French/Spanish', icon: Mic },
                      { id: 'reading', label: 'Read 20 Pages', icon: BookOpen },
                      { id: 'networking', label: '1 Networking Msg', icon: Briefcase },
                    ].map((habit) => (
                      <button
                        key={habit.id}
                        onClick={() => toggleHabit(habit.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                          habits[habit.id] 
                            ? 'bg-green-50 text-green-800' 
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <habit.icon className="w-4 h-4" />
                          <span className={habits[habit.id] ? 'line-through opacity-70' : ''}>
                            {habit.label}
                          </span>
                        </div>
                        {habits[habit.id] ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Center Col: The Schedule */}
              <div className={`${CARD_STYLE} md:col-span-2 flex flex-col`}>
                <h3 className="text-lg font-bold mb-6">Today's Protocol</h3>
                <div className="flex-1 space-y-6 relative pl-4 border-l-2 border-slate-100">
                  {[
                    { time: '06:00', label: 'Wake Up & Hydrate', type: 'personal' },
                    { time: '06:30', label: 'Workout (Outdoor Run)', type: 'health' },
                    { time: '08:30', label: 'Review News (Event Watch)', type: 'media' },
                    { time: '09:00', label: 'Deep Work (or 9:30 Media Slot)', type: 'work' },
                    { time: '13:00', label: 'Media Live Window (or Lunch)', type: 'media' },
                    { time: '14:00', label: 'Handos/Admin Operations', type: 'work' },
                    { time: '18:00', label: 'Standard Shutdown', type: 'alert' },
                    { time: '19:00', label: 'Evening: Family OR Zoom Class (Tue)', type: 'family' },
                  ].map((slot, i) => (
                    <div key={i} className="relative">
                      <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white ${
                        slot.type === 'alert' ? 'bg-red-500' : 
                        slot.type === 'media' ? 'bg-purple-500' : 'bg-blue-400'
                      }`} />
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                        <span className="text-sm font-mono text-slate-400 w-12">{slot.time}</span>
                        <div className="flex items-center gap-2">
                          {slot.type === 'media' && <Tv className="w-4 h-4 text-purple-500" />}
                          <span className={`font-medium ${slot.type === 'alert' ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
                            {slot.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Bottom: The Big Goal */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <DollarSign className="text-yellow-400" /> 2026 Revenue Goal
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Target: $1,000,000. Focus on high-ticket B2G contracts.
                </p>
                <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-1000"
                    style={{ width: `${(revenue / revenueGoal) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-mono mt-2 text-slate-400">
                  <span>${revenue.toLocaleString()}</span>
                  <span>${revenueGoal.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setRevenue(r => r + 10000)}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  + Add Sale
                </button>
              </div>
            </div>
          </>
        )}

        {/* === STRATEGY VIEW === */}
        {activeTab === 'strategy' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={CARD_STYLE}>
              <h3 className="text-xl font-bold mb-4 text-blue-900">Handos Strategy</h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg h-fit"><Briefcase className="w-5 h-5 text-blue-600"/></div>
                  <div>
                    <h4 className="font-bold text-slate-800">Pivot to Policy</h4>
                    <p className="text-sm text-slate-600">Stop selling websites. Sell "Digital Sovereignty" and "Stakeholder Engagement" to Governments & NGOs.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg h-fit"><Radio className="w-5 h-5 text-purple-600"/></div>
                  <div>
                    <h4 className="font-bold text-slate-800">Media Leverage</h4>
                    <p className="text-sm text-slate-600">Use BBC clips to build authority. Hire a PR agent for CNN/Al-Jazeera pitching.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className={CARD_STYLE}>
              <h3 className="text-xl font-bold mb-4 text-blue-900">Personal Pillars</h3>
              <ul className="space-y-4">
                 <li className="flex gap-3">
                  <div className="bg-green-100 p-2 rounded-lg h-fit"><BookOpen className="w-5 h-5 text-green-600"/></div>
                  <div>
                    <h4 className="font-bold text-slate-800">The Scholar (PhD)</h4>
                    <p className="text-sm text-slate-600">Coursework Phase: Evening Zoom classes (Tue) + Saturday Library blocks.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg h-fit"><Heart className="w-5 h-5 text-orange-600"/></div>
                  <div>
                    <h4 className="font-bold text-slate-800">The Family Man</h4>
                    <p className="text-sm text-slate-600">Strict 6:00 PM Shutdown (except Class nights). Date nights. Being present.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
