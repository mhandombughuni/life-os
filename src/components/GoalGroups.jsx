import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { dataService } from '../services/dataService';
import { Target, Plus, Edit, DollarSign, TrendingUp } from 'lucide-react';

export default function GoalGroups() {
  const { user } = useApp();
  const [goalGroups, setGoalGroups] = useState([]);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState('');

  useEffect(() => {
    if (user) {
      loadGoalGroups();
    }
  }, [user]);

  const loadGoalGroups = () => {
    if (!user) return;
    const groups = dataService.getGoalGroups(user.id);
    if (groups && groups.length > 0) {
      setGoalGroups(groups);
    }
  };

  const addGoalGroup = () => {
    if (!newGroupTitle.trim()) return;
    
    const newGroup = {
      id: Date.now().toString(),
      title: newGroupTitle.trim(),
      goals: [],
      createdAt: new Date().toISOString(),
    };
    
    const updated = [...goalGroups, newGroup];
    setGoalGroups(updated);
    dataService.saveGoalGroups(user.id, updated);
    setNewGroupTitle('');
    setShowAddGroup(false);
  };

  const getGoalsForGroup = (groupId) => {
    const allGoals = dataService.getGoals(user.id) || [];
    // If goal doesn't have groupId, assign to first group
    if (allGoals.length > 0 && goalGroups.length > 0) {
      const goalsWithoutGroup = allGoals.filter(g => !g.groupId);
      if (goalsWithoutGroup.length > 0 && groupId === goalGroups[0]?.id) {
        // Assign goals without group to first group
        return [...allGoals.filter(g => g.groupId === groupId), ...goalsWithoutGroup];
      }
    }
    return allGoals.filter(g => g.groupId === groupId);
  };

  return (
    <div className="space-y-6">
      {/* Add Goal Group */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-900">Goal Groups</h3>
        <button
          onClick={() => setShowAddGroup(!showAddGroup)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Group
        </button>
      </div>

      {showAddGroup && (
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <input
            type="text"
            value={newGroupTitle}
            onChange={(e) => setNewGroupTitle(e.target.value)}
            placeholder="e.g., My 2026 Goals, Q1 Objectives..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-3"
            onKeyPress={(e) => e.key === 'Enter' && addGoalGroup()}
          />
          <div className="flex gap-2">
            <button
              onClick={addGoalGroup}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddGroup(false);
                setNewGroupTitle('');
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Goal Groups */}
      {goalGroups.map((group) => {
        const groupGoals = getGoalsForGroup(group.id);
        if (groupGoals.length === 0) return null;

        const biggestGoal = groupGoals.reduce((max, goal) => 
          (goal.target_value || 0) > (max.target_value || 0) ? goal : max
        );

        return (
          <div
            key={group.id}
            className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white rounded-2xl p-6 md:p-8 shadow-lg"
          >
            <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Target className="text-yellow-400" /> {group.title}
            </h4>

            {/* Goals in this group */}
            <div className="space-y-4">
              {groupGoals.map((goal) => {
                const isFinancial = goal.category === 'finance' || goal.name.toLowerCase().includes('revenue') || goal.name.toLowerCase().includes('$');
                const progress = Math.min(((goal.current_value || 0) / (goal.target_value || 1)) * 100, 100);

                return (
                  <div key={goal.id} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h5 className="text-lg font-bold mb-1 flex items-center gap-2">
                          {isFinancial ? <DollarSign className="w-5 h-5 text-yellow-400" /> : <Target className="w-5 h-5 text-blue-400" />}
                          {goal.name}
                        </h5>
                        {goal.target_value && (
                          <p className="text-slate-300 text-sm">
                            Target: {isFinancial && goal.target_value > 1000
                              ? `$${goal.target_value.toLocaleString()}`
                              : goal.target_value}
                          </p>
                        )}
                      </div>
                    </div>

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
                        // Reload to update display
                        window.location.reload();
                      }}
                      className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      + Update Progress
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {goalGroups.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
          <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 mb-4">Create your first goal group to get started</p>
          <button
            onClick={() => setShowAddGroup(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Goal Group
          </button>
        </div>
      )}
    </div>
  );
}

