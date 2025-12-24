import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle, Circle, Briefcase, BookOpen, Heart, Activity, 
  Radio, Mic, DollarSign, Target, Menu, X, Tv, 
  MessageSquare, Settings, Calendar, LogIn, ChevronRight, Send,
  Mail, Lock, User, ArrowRight, Star
} from 'lucide-react';

import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  OAuthProvider,
  signInWithPopup, 
  signInWithEmailAndPassword,
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

// --- CONFIGURATION ---
// Replace with your Firebase Project Config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY_HERE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase safely
let auth, db;
try {
  if (firebaseConfig.apiKey !== "YOUR_API_KEY_HERE" && firebaseConfig.apiKey) {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    console.log("Demo Mode: Firebase keys not detected.");
  }
} catch (e) { console.log("Firebase Init Error", e); }

// --- ICON MAPPING FOR DYNAMIC USER DATA ---
const ICON_MAP = {
  briefcase: Briefcase,
  book: BookOpen,
  heart: Heart,
  mic: Mic,
  activity: Activity,
  star: Star,
  target: Target,
  dollar: DollarSign
};

export default function Kocha360() {
  // Core State
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // Stores custom roles/habits
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  
  // UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [tempProfile, setTempProfile] = useState({
    identities: ['', '', ''],
    habits: ['', '', ''],
    goalLabel: 'Annual Revenue',
    goalTarget: '1000000'
  });

  // Auth Inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Chat State
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const chatEndRef = useRef(null);

  // --- INITIALIZATION ---

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          await fetchUserProfile(currentUser.uid);
        } else {
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      });
      return () => {
        unsubscribe();
        clearInterval(timer);
      };
    } else {
      setLoading(false);
      return () => clearInterval(timer);
    }
  }, []);

  // --- DATA HANDLING ---

  const fetchUserProfile = async (uid) => {
    if (!db) return; // Skip if in demo mode without DB
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      } else {
        // New user! Trigger onboarding
        setShowOnboarding(true);
      }
    } catch (e) {
      console.error("Error fetching profile:", e);
    }
  };

  const saveUserProfile = async (profileData) => {
    if (isDemo) {
      setUserProfile(profileData);
      setShowOnboarding(false);
      return;
    }

    try {
      await setDoc(doc(db, "users", user.uid), profileData);
      setUserProfile(profileData);
      setShowOnboarding(false);
    } catch (e) {
      console.error("Error saving profile:", e);
      alert("Failed to save profile. Check console.");
    }
  };

  // --- ONBOARDING HANDLERS ---

  const handleOnboardingSubmit = () => {
    // Construct the final profile object
    const finalProfile = {
      displayName: user.displayName || user.email.split('@')[0],
      northStar: {
        label: tempProfile.goalLabel,
        target: parseInt(tempProfile.goalTarget.replace(/,/g, '')) || 1000000,
        current: 0
      },
      identities: tempProfile.identities.filter(i => i).map((name, idx) => ({
        id: `role_${idx}`,
        name: name,
        color: ['blue', 'purple', 'green'][idx % 3]
      })),
      habits: tempProfile.habits.filter(h => h).map((name, idx) => ({
        id: `habit_${idx}`,
        label: name,
        icon: ['book', 'heart', 'mic'][idx % 3] || 'activity',
        completed: false
      })),
      weeklyThemes: {
        0: "Rest & Review", 1: "Execution", 2: "Deep Work", 
        3: "Meetings", 4: "Admin", 5: "Family", 6: "Planning"
      }
    };
    saveUserProfile(finalProfile);
  };

  // --- LOGIN HANDLERS ---

  const handleDemoLogin = () => {
    const demoUser = {
      uid: "demo_123",
      displayName: "Guest User",
      email: "guest@kocha.com",
      photoURL: null
    };
    setUser(demoUser);
    setIsDemo(true);
    // Simulate finding no profile, triggering onboarding
    setTimeout(() => setShowOnboarding(true), 500);
  };

  const handleProviderLogin = async (providerName) => {
    if (!auth) return handleDemoLogin();
    
    let provider;
    try {
      if (providerName === 'google') provider = new GoogleAuthProvider();
      if (providerName === 'apple') provider = new OAuthProvider('apple.com');
      if (providerName === 'microsoft') provider = new OAuthProvider('microsoft.com');
      await signInWithPopup(auth, provider);
    } catch (error) {
      alert(`Login error: ${error.message}`);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!auth) return handleDemoLogin();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert(`Login error: ${error.message}`);
    }
  };

  const handleLogout = () => {
    if (auth) signOut(auth);
    setUser(null);
    setUserProfile(null);
    setIsDemo(false);
  };

  // --- DYNAMIC HELPERS ---

  const getTodayTheme = () => {
    if (!userProfile) return "Loading...";
    const dayIndex = currentTime.getDay();
    // Default fallback if weeklyThemes isn't set yet
    const themes = userProfile.weeklyThemes || {
      0: "Rest", 1: "Focus", 2: "Work", 3: "Connect", 4: "Admin", 5: "Family", 6: "Plan"
    };
    return themes[dayIndex];
  };

  const toggleHabit = (habitId) => {
    if (!userProfile) return;
    const updatedHabits = userProfile.habits.map(h => 
      h.id === habitId ? { ...h, completed: !h.completed } : h
    );
    // In real app, we'd save this to DB immediately
    setUserProfile({ ...userProfile, habits: updatedHabits });
    // Save to Firestore if not demo
    if (!isDemo && db && user) {
      setDoc(doc(db, "users", user.uid), { ...userProfile, habits: updatedHabits }, { merge: true });
    }
  };

  // --- COMPONENT RENDER ---

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading Kocha...</div>;

  // 1. LOGIN SCREEN
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
          <div className="flex justify-center mb-4">
            <Activity className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Kocha 360°</h1>
          <p className="text-slate-500">The OS for the Multi-Hyphenate Leader.</p>
          
          {!showEmailForm ? (
            <div className="space-y-3">
              <button onClick={() => handleProviderLogin('google')} className="w-full bg-white border border-slate-300 py-3 rounded-xl font-bold flex justify-center gap-2 hover:bg-slate-50">
                Google Login
              </button>
              <button onClick={() => setShowEmailForm(true)} className="w-full bg-slate-100 py-3 rounded-xl font-bold flex justify-center gap-2 hover:bg-slate-200">
                <Mail className="w-5 h-5"/> Email Login
              </button>
              <button onClick={handleDemoLogin} className="w-full text-slate-400 text-sm mt-4 hover:text-slate-600">
                Try Demo Mode (No Account)
              </button>
            </div>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full border p-2 rounded" placeholder="Email" />
              <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full border p-2 rounded" placeholder="Password" />
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Sign In</button>
              <button type="button" onClick={() => setShowEmailForm(false)} className="w-full text-center text-sm text-slate-500">Back</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // 2. ONBOARDING WIZARD (If Profile Missing)
  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-300">
          <div className="mb-6">
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              <span>Step {onboardingStep} of 3</span>
              <span>Setup Wizard</span>
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 transition-all duration-500" style={{width: `${(onboardingStep/3)*100}%`}} />
            </div>
          </div>

          {onboardingStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800">Who are you?</h2>
              <p className="text-slate-500">Kocha is built for people with multiple roles. List your top 3 identities (e.g., "Founder", "Parent", "Student").</p>
              {[0, 1, 2].map(i => (
                <input 
                  key={i}
                  type="text" 
                  placeholder={`Identity #${i+1}`}
                  className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-blue-500 outline-none font-medium"
                  value={tempProfile.identities[i]}
                  onChange={e => {
                    const newIds = [...tempProfile.identities];
                    newIds[i] = e.target.value;
                    setTempProfile({...tempProfile, identities: newIds});
                  }}
                />
              ))}
              <button 
                onClick={() => setOnboardingStep(2)}
                disabled={!tempProfile.identities[0]}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold mt-4 disabled:opacity-50"
              >
                Next Step <ArrowRight className="inline w-4 h-4 ml-1"/>
              </button>
            </div>
          )}

          {onboardingStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800">Daily Non-Negotiables</h2>
              <p className="text-slate-500">What 3 habits keep you grounded every single day?</p>
              {[0, 1, 2].map(i => (
                <input 
                  key={i}
                  type="text" 
                  placeholder={`Habit #${i+1} (e.g., Read Bible, Run 5k)`}
                  className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-blue-500 outline-none font-medium"
                  value={tempProfile.habits[i]}
                  onChange={e => {
                    const newHabits = [...tempProfile.habits];
                    newHabits[i] = e.target.value;
                    setTempProfile({...tempProfile, habits: newHabits});
                  }}
                />
              ))}
              <div className="flex gap-3 mt-4">
                <button onClick={() => setOnboardingStep(1)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50">Back</button>
                <button onClick={() => setOnboardingStep(3)} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold">Next Step</button>
              </div>
            </div>
          )}

          {onboardingStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800">The North Star</h2>
              <p className="text-slate-500">What is the ONE big metric you are chasing in 2026?</p>
              
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Goal Name</label>
                <input 
                  type="text" 
                  value={tempProfile.goalLabel}
                  onChange={e => setTempProfile({...tempProfile, goalLabel: e.target.value})}
                  className="w-full border-2 border-slate-100 p-3 rounded-xl mb-3 font-medium"
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Target Number</label>
                <input 
                  type="text" 
                  value={tempProfile.goalTarget}
                  onChange={e => setTempProfile({...tempProfile, goalTarget: e.target.value})}
                  className="w-full border-2 border-slate-100 p-3 rounded-xl font-medium"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setOnboardingStep(2)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50">Back</button>
                <button onClick={handleOnboardingSubmit} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold">Launch Kocha</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. MAIN DASHBOARD (Only renders if userProfile exists)
  if (!userProfile) return <div className="min-h-screen flex items-center justify-center">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 relative">
      
      {/* Navigation */}
      <nav className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="text-blue-400" />
            <h1 className="text-xl font-bold tracking-tight">Kocha 360°</h1>
            {isDemo && <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded font-bold">DEMO</span>}
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={() => setActiveTab('dashboard')} className={`${activeTab === 'dashboard' ? 'text-blue-400' : 'text-slate-400'}`}>Dashboard</button>
            <button onClick={() => setShowSettings(true)} className="text-slate-400 hover:text-white"><Settings className="w-5 h-5"/></button>
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-slate-600" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">{userProfile.displayName[0]}</div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 pb-24">
        
        {/* DASHBOARD HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
          <div>
            <div className="flex gap-2 mb-2">
              {userProfile.identities.map(role => (
                <span key={role.id} className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${
                  role.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                  role.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {role.name}
                </span>
              ))}
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              Good {currentTime.getHours() < 12 ? 'Morning' : 'Evening'}, {userProfile.displayName.split(' ')[0]}.
            </h2>
            <p className="text-slate-500 mt-1">
              Today's Theme: <span className="font-semibold text-blue-600">{getTodayTheme()}</span>
            </p>
          </div>
          <div className="text-4xl font-light text-slate-300 hidden md:block">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* DYNAMIC HABITS */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" /> Non-Negotiables
            </h3>
            <div className="space-y-3">
              {userProfile.habits.map((habit) => {
                const Icon = ICON_MAP[habit.icon] || Activity;
                return (
                  <button
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                      habit.completed ? 'bg-green-50 text-green-800' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span className={habit.completed ? 'line-through opacity-70' : ''}>{habit.label}</span>
                    </div>
                    {habit.completed ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CALENDAR (Placeholder for now) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:col-span-2">
            <h3 className="text-lg font-bold mb-4">Unified Timeline</h3>
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Connect your calendars in Settings to see your schedule here.</p>
            </div>
          </div>
        </div>

        {/* NORTH STAR GOAL */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 w-full">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Target className="text-yellow-400" /> {userProfile.northStar.label}
            </h3>
            <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden mt-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-1000"
                style={{ width: `${Math.min((userProfile.northStar.current / userProfile.northStar.target) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-mono mt-2 text-slate-400">
              <span>{userProfile.northStar.current.toLocaleString()}</span>
              <span>{userProfile.northStar.target.toLocaleString()}</span>
            </div>
          </div>
          <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap">
            Update Progress
          </button>
        </div>

      </main>

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Settings</h3>
              <button onClick={() => setShowSettings(false)}><X className="w-6 h-6 text-slate-400"/></button>
            </div>
            <button onClick={handleLogout} className="w-full text-red-600 bg-red-50 py-3 rounded-xl font-bold">Sign Out</button>
          </div>
        </div>
      )}

      {/* AI CHAT BUTTON */}
      <button 
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl z-50 transition-transform hover:scale-105"
      >
        {showChat ? <X /> : <MessageSquare />}
      </button>

      {/* AI CHAT WINDOW */}
      {showChat && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col h-[400px]">
          <div className="bg-slate-900 text-white p-4 font-bold">Kocha AI</div>
          <div className="flex-1 p-4 bg-slate-50 text-slate-500 text-center text-sm flex items-center justify-center">
            AI Connection coming in Phase 3.
          </div>
        </div>
      )}

    </div>
  );
}
