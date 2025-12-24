import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Target, 
  AlertCircle, 
  TrendingUp, 
  Heart, 
  Briefcase, 
  GraduationCap,
  DollarSign,
  Users,
  BookOpen,
  Activity,
  ArrowRight,
  Check
} from 'lucide-react';

const CHALLENGES = [
  { id: 'disorganized', label: 'Disorganized', icon: AlertCircle, description: 'Struggling to keep things in order' },
  { id: 'time-management', label: 'Time Management', icon: Activity, description: 'Difficulty managing time effectively' },
  { id: 'procrastination', label: 'Procrastination', icon: TrendingUp, description: 'Putting off important tasks' },
  { id: 'focus', label: 'Lack of Focus', icon: Target, description: 'Hard to stay focused on priorities' },
  { id: 'work-life-balance', label: 'Work-Life Balance', icon: Heart, description: 'Struggling to balance work and life' },
];

const GOALS = [
  { id: 'business', label: 'Business Growth', icon: Briefcase, color: 'blue' },
  { id: 'finance', label: 'Financial Freedom', icon: DollarSign, color: 'green' },
  { id: 'health', label: 'Health & Fitness', icon: Heart, color: 'red' },
  { id: 'learning', label: 'Learning & Education', icon: GraduationCap, color: 'purple' },
  { id: 'family', label: 'Family & Relationships', icon: Users, color: 'orange' },
  { id: 'spiritual', label: 'Spiritual Growth', icon: BookOpen, color: 'indigo' },
];

export default function Onboarding() {
  const { completeOnboarding, user } = useApp();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(user?.name || '');
  const [challenges, setChallenges] = useState([]);
  const [goals, setGoals] = useState([]);
  const [customGoals, setCustomGoals] = useState('');

  const toggleChallenge = (id) => {
    setChallenges(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  const toggleGoal = (id) => {
    setGoals(prev => 
      prev.includes(id) 
        ? prev.filter(g => g !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = () => {
    completeOnboarding({
      name,
      challenges,
      goals,
      customGoals: customGoals.trim(),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">
              Step {step} of 3
            </span>
            <span className="text-sm text-slate-500">
              {Math.round((step / 3) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full">
                <Target className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  Welcome to Strategy!
                </h2>
                <p className="text-slate-600 text-lg">
                  Let's personalize your experience. This will only take a minute.
                </p>
              </div>
              <div className="pt-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="What should we call you?"
                  className="w-full max-w-md mx-auto px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg"
                  required
                />
              </div>
              <button
                onClick={() => name.trim() && setStep(2)}
                disabled={!name.trim()}
                className="mx-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: Challenges */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  What challenges are you facing?
                </h2>
                <p className="text-slate-600">
                  Select all that apply. This helps us tailor your experience.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CHALLENGES.map((challenge) => {
                  const Icon = challenge.icon;
                  const isSelected = challenges.includes(challenge.id);
                  return (
                    <button
                      key={challenge.id}
                      onClick={() => toggleChallenge(challenge.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-6 h-6 mt-0.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1">
                            {challenge.label}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {challenge.description}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-4 justify-center pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  What do you want to achieve?
                </h2>
                <p className="text-slate-600">
                  Select your main goals. We'll help you build habits to reach them.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {GOALS.map((goal) => {
                  const Icon = goal.icon;
                  const isSelected = goals.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? `border-${goal.color}-500 bg-${goal.color}-50`
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? `text-${goal.color}-600` : 'text-slate-400'}`} />
                      <p className={`text-sm font-medium text-center ${isSelected ? `text-${goal.color}-900` : 'text-slate-700'}`}>
                        {goal.label}
                      </p>
                    </button>
                  );
                })}
              </div>
              <div className="pt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Any other goals? (Optional)
                </label>
                <textarea
                  value={customGoals}
                  onChange={(e) => setCustomGoals(e.target.value)}
                  placeholder="E.g., Learn a new language, start a side business..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="flex gap-4 justify-center pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={goals.length === 0}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Get Started <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

