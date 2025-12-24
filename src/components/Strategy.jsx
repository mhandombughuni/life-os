import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { dataService } from '../services/dataService';
import { 
  Briefcase, 
  Target, 
  Lightbulb,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

const CARD_STYLE = "bg-white p-6 rounded-2xl shadow-sm border border-slate-100";

export default function Strategy() {
  const { user } = useApp();
  const [strategies, setStrategies] = useState([]);
  const [personalPillars, setPersonalPillars] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showAddStrategy, setShowAddStrategy] = useState(false);
  const [newStrategy, setNewStrategy] = useState({ title: '', description: '' });

  useEffect(() => {
    if (user) {
      loadStrategies();
    }
  }, [user]);

  const loadStrategies = () => {
    if (!user) return;
    
    const profile = dataService.getUserProfile(user.id);
    if (profile) {
      setStrategies(profile.strategies || []);
      setPersonalPillars(profile.pillars || []);
    }
  };

  const saveStrategies = (newStrategies, newPillars) => {
    if (!user) return;
    
    const profile = dataService.getUserProfile(user.id) || {};
    const updatedProfile = {
      ...profile,
      strategies: newStrategies,
      pillars: newPillars,
    };
    dataService.saveUserProfile(user.id, updatedProfile);
    loadStrategies();
  };

  const handleAddStrategy = () => {
    if (!newStrategy.title.trim()) return;
    
    const updated = [...strategies, {
      id: Date.now().toString(),
      ...newStrategy,
      createdAt: new Date().toISOString(),
    }];
    saveStrategies(updated, personalPillars);
    setNewStrategy({ title: '', description: '' });
    setShowAddStrategy(false);
  };

  const handleDeleteStrategy = (id) => {
    const updated = strategies.filter(s => s.id !== id);
    saveStrategies(updated, personalPillars);
  };

  const handleAddPillar = () => {
    const pillar = prompt('Enter pillar name:');
    if (pillar && pillar.trim()) {
      const updated = [...personalPillars, {
        id: Date.now().toString(),
        name: pillar.trim(),
        description: '',
      }];
      saveStrategies(strategies, updated);
    }
  };

  const handleDeletePillar = (id) => {
    const updated = personalPillars.filter(p => p.id !== id);
    saveStrategies(strategies, updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Your Strategy</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strategy Section */}
        <div className={CARD_STYLE}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5" /> Strategic Focus
            </h3>
            <button
              onClick={() => setShowAddStrategy(!showAddStrategy)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 text-blue-600" />
            </button>
          </div>

          {showAddStrategy && (
            <div className="mb-4 p-4 bg-slate-50 rounded-xl space-y-3">
              <input
                type="text"
                placeholder="Strategy title"
                value={newStrategy.title}
                onChange={(e) => setNewStrategy({ ...newStrategy, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Description"
                value={newStrategy.description}
                onChange={(e) => setNewStrategy({ ...newStrategy, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddStrategy}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddStrategy(false);
                    setNewStrategy({ title: '', description: '' });
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <ul className="space-y-4">
            {strategies.length > 0 ? (
              strategies.map((strategy) => (
                <li key={strategy.id} className="flex gap-3 group">
                  <div className="bg-blue-100 p-2 rounded-lg h-fit">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800">{strategy.title}</h4>
                      <button
                        onClick={() => handleDeleteStrategy(strategy.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{strategy.description}</p>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-500 text-center py-4">
                Add your strategic focuses here
              </li>
            )}
          </ul>
        </div>

        {/* Personal Pillars */}
        <div className={CARD_STYLE}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
              <Target className="w-5 h-5" /> Personal Pillars
            </h3>
            <button
              onClick={handleAddPillar}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 text-blue-600" />
            </button>
          </div>

          <ul className="space-y-4">
            {personalPillars.length > 0 ? (
              personalPillars.map((pillar) => (
                <li key={pillar.id} className="flex gap-3 group">
                  <div className="bg-green-100 p-2 rounded-lg h-fit">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800">{pillar.name}</h4>
                      <button
                        onClick={() => handleDeletePillar(pillar.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                    {pillar.description && (
                      <p className="text-sm text-slate-600 mt-1">{pillar.description}</p>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-500 text-center py-4">
                Add your personal pillars here
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className={`${CARD_STYLE} bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200`}>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-slate-900">AI Recommendations</h3>
        </div>
        <p className="text-slate-600 text-sm">
          Based on your goals and challenges, we'll suggest strategies and help you build habits 
          that align with your personal pillars. Keep tracking your progress to get personalized insights!
        </p>
      </div>
    </div>
  );
}

