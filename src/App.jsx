import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle, Circle, Briefcase, BookOpen, Heart, Activity, 
  Radio, Mic, DollarSign, Target, Menu, X, Tv, 
  MessageSquare, Settings, Calendar, LogIn, ChevronRight, Send,
  Mail, Lock
} from 'lucide-react';

// --- FIREBASE SETUP ---
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
import { getFirestore } from "firebase/firestore";

// REPLACE WITH YOUR KEYS
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY_HERE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase
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

export default function MhandoOS() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  
  // Auth Form State
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Mhando's Specific Data
  const [revenue, setRevenue] = useState(150000);
  const [habits, setHabits] = useState({
    workout: false, french: false, bible: false, reading: false, networking: false
  });
  
  // Chat State
  const [messages, setMessages] = useState([
    { role: 'system', text: "Hello Mhando. I am Kocha. I see you are in 'CEO Mode' right now. What is on your mind?" }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const chatEndRef = useRef(null);

  // Calendar State
  const [calendars, setCalendars] = useState({
    google: false, outlook: false, apple: false
  });

  // Auth Listener
  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setIsDemo(false);
      });
      return () => unsubscribe();
    }
  }, []);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showChat]);

  // --- MHANDO SPECIFIC LOGIC ---

  const getDayTheme = () => {
    const day = currentTime.getDay();
    const themes = [
      "The Pastor (Ministry)", // Sunday
      "The CEO (Strategy)",    // Monday
      "The Scholar (PhD)",     // Tuesday
      "The Maker (Product)",   // Wednesday
      "The Connector (Network)", // Thursday
      "The Closer (Admin)",    // Friday
      "The Father (Family)"    // Saturday
    ];
    return themes[day];
  };

  // --- HANDLERS ---

  const handleDemoLogin = () => {
    setUser({
      displayName: "Mhando (Demo)",
      photoURL: "https://ui-avatars.com/api/?name=Mhando+Demo&background=0D8ABC&color=fff",
      email: "demo@handos.com"
    });
    setIsDemo(true);
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
      alert(`Login failed: ${error.message}`);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!auth) return handleDemoLogin();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert(`Login failed: ${error.message}`);
    }
  };

  const handleLogout = () => {
    if (auth) signOut(auth);
    setUser(null);
    setIsDemo(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: inputMessage }]);
    setInputMessage("");
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'system', 
        text: "I've noted that. Since that aligns with your 'Scholar' identity, should we block out time on Tuesday evening for it?" 
      }]);
    }, 1000);
  };

  // --- LOGIN SCREEN ---
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
          <div className="flex justify-center mb-4"><Activity className="w-16 h-16 text-blue-600" /></div>
          <h1 className="text-3xl font-bold text-slate-900">Mhando OS</h1>
          <p className="text-slate-500">Personal Operating System.</p>
          
          {!showEmailForm ? (
            <div className="space-y-3">
              <button onClick={() => handleProviderLogin('google')} className="w-full bg-white border border-slate-300 py-3 rounded-xl font-bold hover:bg-slate-50">Sign in with Google</button>
              <button onClick={() => handleProviderLogin('microsoft')} className="w-full bg-[#00a4ef] text-white py-3 rounded-xl font-bold hover:bg-[#0078d4]">Sign in with Microsoft</button>
              <button onClick={() => handleProviderLogin('apple')} className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800">Sign in with Apple</button>
              <button onClick={() => setShowEmailForm(true)} className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200"><Mail className="w-5 h-5 inline mr-2" />Sign in with Email</button>
            </div>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full border p-2 rounded" placeholder="Email" />
              <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full border p-2 rounded" placeholder="Password" />
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Sign In</button>
              <button type="button" onClick={() => setShowEmailForm(false)} className="w-full text-center text-sm">Back</button>
            </form>
          )}
          <div className="text-center text-xs text-slate-400">Secure Access for Mhando Only</div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 relative">
      <nav className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="text-blue-400" />
            <h1 className="text-xl font-bold tracking-tight">Mhando OS</h1>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={() => setActiveTab('dashboard')} className={`${activeTab === 'dashboard' ? 'text-blue-400' : 'text-slate-400'}`}>Dashboard</button>
            <button onClick={() => setShowSettings(true)} className="text-slate-400 hover:text-white"><Settings className="w-5 h-5"/></button>
            <img src={user.photoURL || "https://ui-avatars.com/api/?name=Mhando"} alt="Profile" className="w-8 h-8 rounded-full border border-slate-600" />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 pb-24">
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
              <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold">Settings</h3><button onClick={() => setShowSettings(false)}><X className="w-6 h-6 text-slate-400"/></button></div>
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                  <span>Google Calendar</span>
                  <button onClick={() => setCalendars(p => ({...p, google: !p.google}))} className={`px-2 py-1 rounded text-xs font-bold ${calendars.google ? 'bg-green-100 text-green-700' : 'bg-slate-200'}`}>{calendars.google ? 'ON' : 'OFF'}</button>
                </div>
                 <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                  <span>Outlook Calendar</span>
                  <button onClick={() => setCalendars(p => ({...p, outlook: !p.outlook}))} className={`px-2 py-1 rounded text-xs font-bold ${calendars.outlook ? 'bg-green-100 text-green-700' : 'bg-slate-200'}`}>{calendars.outlook ? 'ON' : 'OFF'}</button>
                </div>
                 <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                  <span>Apple Calendar</span>
                  <button onClick={() => setCalendars(p => ({...p, apple: !p.apple}))} className={`px-2 py-1 rounded text-xs font-bold ${calendars.apple ? 'bg-green-100 text-green-700' : 'bg-slate-200'}`}>{calendars.apple ? 'ON' : 'OFF'}</button>
                </div>
                <button onClick={handleLogout} className="w-full text-red-600 py-2 border border-red-100 rounded">Sign Out</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <>
            <header className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">{getDayTheme().split('(')[0]} Mode</h2>
                <p className="text-slate-500 mt-1"><span className="font-semibold text-blue-600">{currentTime.toLocaleDateString('en-US', { weekday: 'long' })}</span> Protocol Active.</p>
              </div>
              <div className="text-right hidden md:block"><div className="text-4xl font-light text-slate-300">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div></div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-green-500" /> Non-Negotiables</h3>
                <div className="space-y-3">
                    {[
                      { id: 'bible', label: 'Bible & Prayer', icon: BookOpen },
                      { id: 'workout', label: 'Workout', icon: Heart },
                      { id: 'french', label: 'French/Spanish', icon: Mic },
                      { id: 'reading', label: 'Read 20 Pages', icon: BookOpen },
                    ].map((habit) => (
                      <button key={habit.id} onClick={() => setHabits(prev => ({ ...prev, [habit.id]: !prev[habit.id] }))} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${habits[habit.id] ? 'bg-green-50 text-green-800' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                        <div className="flex items-center gap-3"><habit.icon className="w-4 h-4" /><span className={habits[habit.id] ? 'line-through opacity-70' : ''}>{habit.label}</span></div>
                        {habits[habit.id] ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                      </button>
                    ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:col-span-2">
                <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold">Unified Timeline</h3></div>
                <div className="flex-1 space-y-6 relative pl-4 border-l-2 border-slate-100">
                  {[
                    { time: '06:00', label: 'Wake Up & Hydrate', type: 'personal', source: 'Apple' },
                    { time: '09:00', label: 'Deep Work (Handos)', type: 'work', source: 'Google' },
                    { time: '13:00', label: 'Media Watch', type: 'media', source: 'LifeOS' },
                    { time: '19:00', label: 'PhD Class (Tue) / Family', type: 'family', source: 'Google' },
                  ].map((slot, i) => (
                    <div key={i} className="relative">
                      <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white ${slot.type === 'media' ? 'bg-purple-500' : 'bg-blue-400'}`} />
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                        <span className="text-sm font-mono text-slate-400 w-12">{slot.time}</span>
                        <div className="flex items-center gap-2">{slot.type === 'media' && <Tv className="w-4 h-4 text-purple-500" />}<span className="font-medium text-slate-700">{slot.label}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 bg-slate-900 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><DollarSign className="text-yellow-400" /> 2026 Revenue Goal</h3>
                <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden mt-2"><div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-1000" style={{ width: `${(revenue / 1000000) * 100}%` }} /></div>
                <div className="flex justify-between text-xs font-mono mt-2 text-slate-400"><span>${revenue.toLocaleString()}</span><span>$1,000,000</span></div>
              </div>
              <button onClick={() => setRevenue(r => r + 5000)} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition">+ Add Sale</button>
            </div>
          </>
        )}
      </main>

      <button onClick={() => setShowChat(!showChat)} className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl z-50 transition-transform hover:scale-105">{showChat ? <X /> : <MessageSquare />}</button>

      {showChat && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden h-[500px]">
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/><span className="font-bold">Kocha AI</span></div><span className="text-xs text-slate-400">The Strategist</span></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] rounded-2xl p-3 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none shadow-sm'}`}>{msg.text}</div></div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="Tell Kocha what's wrong..." className="flex-1 bg-slate-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700"><Send className="w-4 h-4" /></button>
          </form>
        </div>
      )}
    </div>
  );
}
