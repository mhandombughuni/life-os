import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { dataService } from '../services/dataService';
import { proactiveAIService } from '../services/proactiveAIService';
import { Target, Plus, Edit, Trash2, DollarSign, TrendingUp, Bot } from 'lucide-react';
import AIEngagementDialog from './AIEngagementDialog';

const CARD_STYLE = "bg-white p-6 rounded-2xl shadow-sm border border-slate-100";

export default function GoalsManager() {
  const { user } = useApp();
  const [goals, setGoals] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    current: 0,
    target: 100,
    category: 'general',
    deadline: '',
  });
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [selectedGoalForAI, setSelectedGoalForAI] = useState(null);

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = () => {
    if (!user) return;
    const userGoals = dataService.getGoals(user.id);
    setGoals(userGoals);
  };

  const saveGoals = (updated) => {
    if (!user) return;
    dataService.saveGoals(user.id, updated);
    loadGoals();
  };

  const handleAddGoal = async () => {
    if (!newGoal.name.trim()) return;

    const goal = {
      id: Date.now().toString(),
      ...newGoal,
      createdAt: new Date().toISOString(),
      aiAnalyzed: false,
    };

    const updatedGoals = [...goals, goal];
    saveGoals(updatedGoals);
    
    // Check if AI should engage
    const engagement = proactiveAIService.analyzeAndEngage(user.id, goal);
    if (engagement && engagement.needsEngagement) {
      setSelectedGoalForAI(goal);
      setShowAIDialog(true);
    }
    
    setNewGoal({ name: '', current: 0, target: 100, category: 'general', deadline: '' });
    setShowAdd(false);
  };

  const handleUpdateGoal = (id, updates) => {
    const updated = goals.map(g =>
      g.id === id ? { ...g, ...updates } : g
    );
    saveGoals(updated);
  };

  const handleDeleteGoal = (id) => {
    const updated = goals.filter(g => g.id !== id);
    saveGoals(updated);
  };

  const handleAIComplete = (analysisData) => {
    // Reload goals to show AI recommendations
    loadGoals();
    setShowAIDialog(false);
    setSelectedGoalForAI(null);
  };

  return (
    <div className="space-y-6">
      {/* AI Engagement Dialog */}
      {showAIDialog && selectedGoalForAI && (
        <AIEngagementDialog
          goal={selectedGoalForAI}
          onClose={() => {
            setShowAIDialog(false);
            setSelectedGoalForAI(null);
          }}
          onComplete={handleAIComplete}
        />
      )}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-500" /> Goals
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Goal
        </button>
      </div>

      {showAdd && (
        <div className={CARD_STYLE}>
          <h3 className="text-lg font-bold mb-4">New Goal</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Goal name"
              value={newGoal.name}
              onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current</label>
                <input
                  type="number"
                  value={newGoal.current}
                  onChange={(e) => setNewGoal({ ...newGoal, current: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target</label>
                <input
                  type="number"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: parseFloat(e.target.value) || 100 })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General</option>
                <option value="business">Business</option>
                <option value="finance">Finance</option>
                <option value="health">Health</option>
                <option value="learning">Learning</option>
              </select>
              <input
                type="date"
                placeholder="Deadline"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddGoal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Goal
              </button>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setNewGoal({ name: '', current: 0, target: 100, category: 'general', deadline: '' });
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => {
              const needsAI = !goal.aiAnalyzed && (goal.name.toLowerCase().includes('million') || goal.name.toLowerCase().includes('revenue') || goal.name.toLowerCase().includes('company'));
            const percentage = Math.min((goal.current / goal.target) * 100, 100);
            const isFinancial = goal.category === 'finance' || goal.name.toLowerCase().includes('revenue') || goal.name.toLowerCase().includes('$');
            
            return (
              <div key={goal.id} className={`${CARD_STYLE} ${isFinancial ? 'border-l-4 border-green-500' : 'border-l-4 border-blue-500'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                      {isFinancial ? <DollarSign className="w-5 h-5 text-green-600" /> : <Target className="w-5 h-5 text-blue-600" />}
                      {goal.name}
                    </h3>
                    {goal.deadline && (
                      <p className="text-xs text-slate-500">
                        Due: {new Date(goal.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-bold text-slate-900">
                      {isFinancial ? `$${goal.current.toLocaleString()}` : goal.current}
                    </span>
                    <span className="text-sm text-slate-500">
                      of {isFinancial ? `$${goal.target.toLocaleString()}` : goal.target}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all ${
                        percentage >= 100 ? 'bg-green-500' :
                        percentage >= 70 ? 'bg-blue-500' :
                        percentage >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>{Math.round(percentage)}% complete</span>
                    {goal.target - goal.current > 0 && (
                      <span>
                        {isFinancial 
                          ? `$${(goal.target - goal.current).toLocaleString()} to go`
                          : `${goal.target - goal.current} remaining`
                        }
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {needsAI && (
                    <button
                      onClick={() => {
                        const engagement = proactiveAIService.analyzeAndEngage(user.id, goal);
                        if (engagement && engagement.needsEngagement) {
                          setSelectedGoalForAI(goal);
                          setShowAIDialog(true);
                        }
                      }}
                      className="px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <Bot className="w-4 h-4" /> AI Analysis
                    </button>
                  )}
                  <button
                    onClick={() => handleUpdateGoal(goal.id, { current: goal.current + (goal.target * 0.1) })}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <TrendingUp className="w-4 h-4" /> Update Progress
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={CARD_STYLE}>
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No goals yet. Add your first goal to start tracking progress!</p>
          </div>
        </div>
      )}
    </div>
  );
}

