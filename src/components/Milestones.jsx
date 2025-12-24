import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { dataService } from '../services/dataService';
import { Award, Target, Plus, CheckCircle, Calendar } from 'lucide-react';

const CARD_STYLE = "bg-white p-6 rounded-2xl shadow-sm border border-slate-100";

export default function Milestones() {
  const { user } = useApp();
  const [milestones, setMilestones] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    targetDate: '',
    category: 'general',
  });

  useEffect(() => {
    if (user) {
      loadMilestones();
    }
  }, [user]);

  const loadMilestones = () => {
    if (!user) return;
    const userMilestones = dataService.getMilestones(user.id);
    setMilestones(userMilestones);
  };

  const saveMilestones = (updated) => {
    if (!user) return;
    dataService.saveMilestones(user.id, updated);
    loadMilestones();
  };

  const handleAddMilestone = () => {
    if (!newMilestone.title.trim()) return;

    const milestone = {
      id: Date.now().toString(),
      ...newMilestone,
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      progress: 0,
    };

    saveMilestones([...milestones, milestone]);
    setNewMilestone({ title: '', description: '', targetDate: '', category: 'general' });
    setShowAdd(false);
  };

  const handleCompleteMilestone = (id) => {
    const updated = milestones.map(m =>
      m.id === id
        ? { ...m, completed: true, completedAt: new Date().toISOString(), progress: 100 }
        : m
    );
    saveMilestones(updated);
  };

  const handleDeleteMilestone = (id) => {
    const updated = milestones.filter(m => m.id !== id);
    saveMilestones(updated);
  };

  const completedMilestones = milestones.filter(m => m.completed);
  const activeMilestones = milestones.filter(m => !m.completed);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-6 h-6 text-yellow-500" /> Milestones
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Milestone
        </button>
      </div>

      {showAdd && (
        <div className={CARD_STYLE}>
          <h3 className="text-lg font-bold mb-4">New Milestone</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Milestone title"
              value={newMilestone.title}
              onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Description"
              value={newMilestone.description}
              onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                placeholder="Target date"
                value={newMilestone.targetDate}
                onChange={(e) => setNewMilestone({ ...newMilestone, targetDate: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newMilestone.category}
                onChange={(e) => setNewMilestone({ ...newMilestone, category: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General</option>
                <option value="business">Business</option>
                <option value="health">Health</option>
                <option value="learning">Learning</option>
                <option value="personal">Personal</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddMilestone}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Milestone
              </button>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setNewMilestone({ title: '', description: '', targetDate: '', category: 'general' });
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Milestones */}
      {activeMilestones.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Active Milestones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeMilestones.map((milestone) => (
              <div key={milestone.id} className={`${CARD_STYLE} border-l-4 border-blue-500`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{milestone.title}</h4>
                    {milestone.description && (
                      <p className="text-sm text-slate-600 mt-1">{milestone.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleCompleteMilestone(milestone.id)}
                    className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                    title="Mark as complete"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </button>
                </div>
                {milestone.targetDate && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-3">
                    <Calendar className="w-4 h-4" />
                    <span>Target: {new Date(milestone.targetDate).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="mt-3">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${milestone.progress || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Milestones */}
      {completedMilestones.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" /> Completed Milestones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedMilestones.map((milestone) => (
              <div key={milestone.id} className={`${CARD_STYLE} bg-green-50 border-l-4 border-green-500 opacity-75`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h4 className="font-bold text-slate-900 line-through">{milestone.title}</h4>
                    </div>
                    {milestone.completedAt && (
                      <p className="text-xs text-slate-500">
                        Completed on {new Date(milestone.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {milestones.length === 0 && (
        <div className={CARD_STYLE}>
          <div className="text-center py-8">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No milestones yet. Add your first milestone to start tracking your achievements!</p>
          </div>
        </div>
      )}
    </div>
  );
}

