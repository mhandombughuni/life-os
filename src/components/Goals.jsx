import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { dataService } from '../services/dataService';
import { Target, DollarSign, TrendingUp } from 'lucide-react';

export default function Goals() {
  const { user } = useApp();
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = () => {
    if (!user) return;
    const allGoals = dataService.getGoals(user.id) || [];
    setGoals(allGoals);
  };

  const getBiggestGoal = () => {
    if (goals.length === 0) return null;
    return goals.reduce((max, goal) => 
      (goal.target_value || 0) > (max.target_value || 0) ? goal : max
    );
  };

  const biggestGoal = getBiggestGoal();

  if (goals.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
        <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 mb-4">No goals yet. Create your strategy to generate goals automatically.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {goals.map((goal) => {
        const isFinancial = goal.category === 'finance' || goal.name.toLowerCase().includes('revenue') || goal.name.toLowerCase().includes('$');
        const progress = Math.min(((goal.current_value || 0) / (goal.target_value || 1)) * 100, 100);

        return (
          <div
            key={goal.id}
            className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white rounded-2xl p-6 md:p-8 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-4">
              {isFinancial ? <DollarSign className="w-6 h-6 text-yellow-400" /> : <Target className="w-6 h-6 text-blue-400" />}
              <h4 className="text-xl font-bold">{goal.name}</h4>
            </div>

            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              {goal.target_value && (
                <p className="text-slate-300 text-sm mb-3">
                  Target: {isFinancial && goal.target_value > 1000
                    ? `$${goal.target_value.toLocaleString()}`
                    : goal.target_value}
                </p>
              )}

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-mono mt-2 text-slate-400">
                  <span>
                    {isFinancial && goal.current_value > 1000
                      ? `$${(goal.current_value || 0).toLocaleString()}`
                      : goal.current_value || 0}
                  </span>
                  <span>
                    {isFinancial && goal.target_value > 1000
                      ? `$${goal.target_value.toLocaleString()}`
                      : goal.target_value}
                  </span>
                </div>
              </div>

              {/* Update Progress */}
              <button
                onClick={() => {
                  const allGoals = dataService.getGoals(user.id);
                  const updated = allGoals.map(g =>
                    g.id === goal.id
                      ? { ...g, current_value: (g.current_value || 0) + (g.target_value * 0.01) }
                      : g
                  );
                  dataService.saveGoals(user.id, updated);
                  loadGoals();
                }}
                className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                + Update Progress
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

