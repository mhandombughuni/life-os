import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { dataService } from '../services/dataService';
import { 
  Briefcase, 
  Target, 
  Edit,
  Trash2,
  Bot,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import StrategyQuestionnaire from './StrategyQuestionnaire';

const CARD_STYLE = "bg-white p-6 rounded-2xl shadow-sm border border-slate-100";

export default function Strategy() {
  const { user } = useApp();
  const [strategies, setStrategies] = useState([]);
  const [personalPillars, setPersonalPillars] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState(false);

  useEffect(() => {
    if (user) {
      loadStrategies();
      checkQuestionnaireStatus();
    }
  }, [user]);

  const checkQuestionnaireStatus = () => {
    if (!user) return;
    const profile = dataService.getUserProfile(user.id);
    setHasCompletedQuestionnaire(!!(profile?.strategies && profile.strategies.length > 0));
  };

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
    checkQuestionnaireStatus();
  };

  const handleQuestionnaireComplete = (data) => {
    // Save AI-generated strategies and pillars
    const strategies = data.strategies || [];
    const pillars = data.pillars || [];
    
    saveStrategies(strategies, pillars);
    
    // Generate goals from the strategy
    if (strategies.length > 0 || pillars.length > 0) {
      generateGoalsFromStrategy(strategies, pillars);
    }
    
    setShowQuestionnaire(false);
    setHasCompletedQuestionnaire(true);
  };

  const generateGoalsFromStrategy = async (strategiesList, pillarsList) => {
    if (!user || (strategiesList.length === 0 && pillarsList.length === 0)) return;
    
    const profile = dataService.getUserProfile(user.id);
    const challenges = profile?.challenges || [];
    
    try {
      const response = await fetch('http://localhost:8000/api/ai/generate-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          strategic_focus: strategiesList.map(s => s.title || s.name),
          personal_pillars: pillarsList.map(p => p.name),
          challenges: challenges,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.goals && data.goals.length > 0) {
          const existingGoals = dataService.getGoals(user.id) || [];
          const newGoals = data.goals.map(goal => ({
            ...goal,
            id: Date.now().toString() + Math.random(),
          }));
          dataService.saveGoals(user.id, [...existingGoals, ...newGoals]);
        }
      }
    } catch (error) {
      console.error('Failed to generate goals from strategy:', error);
      generateFallbackGoals(strategiesList, pillarsList);
    }
  };

  const generateFallbackGoals = (strategiesList, pillarsList) => {
    const goals = [];
    strategiesList.forEach(strategy => {
      const title = strategy.title || strategy.name || '';
      if (title.toLowerCase().includes('revenue') || title.toLowerCase().includes('business')) {
        goals.push({
          id: Date.now().toString() + Math.random(),
          name: `Achieve ${title}`,
          current_value: 0,
          target_value: 1000000,
          category: 'business',
        });
      }
    });
    
    if (goals.length > 0) {
      const existingGoals = dataService.getGoals(user.id) || [];
      dataService.saveGoals(user.id, [...existingGoals, ...goals]);
    }
  };

  const handleEditStrategy = (strategy) => {
    setEditing({ ...strategy, type: 'strategy' });
  };

  const handleEditPillar = (pillar) => {
    setEditing({ ...pillar, type: 'pillar' });
  };

  const handleSaveEdit = () => {
    if (editing.type === 'strategy') {
      const updated = strategies.map(s => 
        s.id === editing.id ? { ...s, title: editing.title, description: editing.description } : s
      );
      saveStrategies(updated, personalPillars);
    } else {
      const updated = personalPillars.map(p => 
        p.id === editing.id ? { ...p, name: editing.name, description: editing.description } : p
      );
      saveStrategies(strategies, updated);
    }
    setEditing(null);
  };

  const handleDeleteStrategy = (id) => {
    const updated = strategies.filter(s => s.id !== id);
    saveStrategies(updated, personalPillars);
  };

  const handleDeletePillar = (id) => {
    const updated = personalPillars.filter(p => p.id !== id);
    saveStrategies(strategies, updated);
  };

  if (showQuestionnaire) {
    return (
      <div className="space-y-6">
        <StrategyQuestionnaire onComplete={handleQuestionnaireComplete} />
      </div>
    );
  }

  if (!hasCompletedQuestionnaire) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200 text-center">
          <Bot className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Build Your Strategy with AI</h2>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Our AI will analyze your pain points, strengths, and limitations to generate personalized strategies, 
            pillars, and goals tailored to your unique situation.
          </p>
          <button
            onClick={() => setShowQuestionnaire(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2 mx-auto"
          >
            <Sparkles className="w-5 h-5" /> Start AI Strategy Builder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Your Strategy</h2>
        <button
          onClick={() => setShowQuestionnaire(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
        >
          <Sparkles className="w-4 h-4" /> Regenerate with AI
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strategy Section */}
        <div className={CARD_STYLE}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5" /> Strategic Focus
            </h3>
          </div>

          <ul className="space-y-4">
            {strategies.length > 0 ? (
              strategies.map((strategy) => (
                <li key={strategy.id} className="flex gap-3 group">
                  <div className="bg-blue-100 p-2 rounded-lg h-fit">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      {editing && editing.id === strategy.id && editing.type === 'strategy' ? (
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={editing.title}
                            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                          />
                          <textarea
                            value={editing.description || ''}
                            onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveEdit}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditing(null)}
                              className="px-3 py-1 border border-slate-300 rounded text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800">{strategy.title || strategy.name}</h4>
                            <p className="text-sm text-slate-600 mt-1">{strategy.description}</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditStrategy(strategy)}
                              className="p-1 hover:bg-blue-100 rounded"
                            >
                              <Edit className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteStrategy(strategy.id)}
                              className="p-1 hover:bg-red-100 rounded"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-500 text-center py-4">
                No strategies yet. Start the AI questionnaire to generate strategies.
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
                      {editing && editing.id === pillar.id && editing.type === 'pillar' ? (
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={editing.name}
                            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                          />
                          <textarea
                            value={editing.description || ''}
                            onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveEdit}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditing(null)}
                              className="px-3 py-1 border border-slate-300 rounded text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800">{pillar.name}</h4>
                            {pillar.description && (
                              <p className="text-sm text-slate-600 mt-1">{pillar.description}</p>
                            )}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditPillar(pillar)}
                              className="p-1 hover:bg-blue-100 rounded"
                            >
                              <Edit className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDeletePillar(pillar.id)}
                              className="p-1 hover:bg-red-100 rounded"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-500 text-center py-4">
                No pillars yet. Start the AI questionnaire to generate pillars.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
