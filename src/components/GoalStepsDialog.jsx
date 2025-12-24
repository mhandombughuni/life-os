import React, { useState, useEffect } from 'react';
import { X, Target, Calendar, CheckCircle, Circle } from 'lucide-react';
import { dataService } from '../services/dataService';
import { useApp } from '../context/AppContext';

export default function GoalStepsDialog({ goal, onClose }) {
  const { user } = useApp();
  const [steps, setSteps] = useState([]);
  const [quarterlyActivities, setQuarterlyActivities] = useState([]);

  useEffect(() => {
    loadGoalSteps();
  }, [goal]);

  const loadGoalSteps = () => {
    if (!user || !goal) return;
    
    const goalData = dataService.getGoalSteps(user.id, goal.id);
    if (goalData) {
      setSteps(goalData.steps || []);
      setQuarterlyActivities(goalData.quarterlyActivities || []);
    } else {
      // Generate default steps based on goal
      generateDefaultSteps();
    }
  };

  const generateDefaultSteps = () => {
    // Generate quarterly activities
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const activities = quarters.map((quarter, index) => ({
      id: `q${index + 1}`,
      quarter,
      activities: [
        `Set up foundation for ${goal.name}`,
        `Complete initial milestones`,
        `Track progress weekly`,
      ],
      completed: false,
    }));

    setQuarterlyActivities(activities);

    // Generate action steps
    const defaultSteps = [
      { id: '1', text: 'Define specific milestones', completed: false },
      { id: '2', text: 'Break down into quarterly targets', completed: false },
      { id: '3', text: 'Set up tracking system', completed: false },
      { id: '4', text: 'Review progress monthly', completed: false },
    ];

    setSteps(defaultSteps);
  };

  const saveSteps = () => {
    if (!user || !goal) return;
    dataService.saveGoalSteps(user.id, goal.id, {
      steps,
      quarterlyActivities,
    });
  };

  const toggleStep = (stepId) => {
    const updated = steps.map(s => 
      s.id === stepId ? { ...s, completed: !s.completed } : s
    );
    setSteps(updated);
    saveSteps();
  };

  const toggleQuarterlyActivity = (quarterId, activityIndex) => {
    const updated = quarterlyActivities.map(q => {
      if (q.id === quarterId) {
        const activities = [...q.activities];
        // For simplicity, mark quarter as completed if all activities done
        return { ...q, completed: !q.completed };
      }
      return q;
    });
    setQuarterlyActivities(updated);
    saveSteps();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" /> {goal.name}
            </h2>
            <p className="text-sm text-slate-500 mt-1">Goal Steps & Quarterly Activities</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Action Steps */}
          <div>
            <h3 className="text-lg font-bold mb-4">Action Steps</h3>
            <div className="space-y-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
                >
                  <button
                    onClick={() => toggleStep(step.id)}
                    className="flex-shrink-0"
                  >
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  <span className={step.completed ? 'line-through text-slate-500' : 'text-slate-900'}>
                    {step.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quarterly Activities */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Quarterly Activities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quarterlyActivities.map((quarter) => (
                <div
                  key={quarter.id}
                  className={`p-4 rounded-lg border-2 ${
                    quarter.completed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-900">{quarter.quarter}</h4>
                    <button
                      onClick={() => toggleQuarterlyActivity(quarter.id, 0)}
                      className="flex-shrink-0"
                    >
                      {quarter.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  </div>
                  <ul className="space-y-1 text-sm text-slate-600">
                    {quarter.activities.map((activity, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-slate-400 mt-1">•</span>
                        <span>{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

