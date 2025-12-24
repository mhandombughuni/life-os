import React, { useState } from 'react';
import { Lightbulb, Target, AlertTriangle, CheckCircle } from 'lucide-react';

const CARD_STYLE = "bg-white p-6 rounded-2xl shadow-sm border border-slate-100";

export default function PriorityManager({ goals, todos }) {
  const [suggestions, setSuggestions] = useState([]);

  React.useEffect(() => {
    generatePrioritySuggestions();
  }, [goals, todos]);

  const generatePrioritySuggestions = () => {
    const suggestionsList = [];

    // Count high-priority todos
    const highPriorityTodos = todos.filter(t => t.priority === 'high' && !t.completed);
    if (highPriorityTodos.length > 3) {
      suggestionsList.push({
        type: 'warning',
        message: `You have ${highPriorityTodos.length} high-priority tasks. Focus on the top 3 most important ones first.`,
        action: 'Focus on top 3 priorities',
      });
    }

    // Check for multiple urgent goals
    const urgentGoals = goals.filter(g => {
      const progress = (g.current_value || 0) / (g.target_value || 1);
      const daysRemaining = g.deadline 
        ? Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24))
        : null;
      return progress < 0.5 && daysRemaining && daysRemaining < 30;
    });

    if (urgentGoals.length > 2) {
      suggestionsList.push({
        type: 'alert',
        message: `Multiple goals need attention. Focus on one at a time to avoid overwhelm.`,
        action: 'Pick your #1 priority goal',
      });
    }

    // Time blocking suggestion
    if (highPriorityTodos.length > 0 && goals.length > 0) {
      suggestionsList.push({
        type: 'tip',
        message: 'Use time-blocking: Dedicate specific time slots to your top priorities. This prevents distraction and overwhelm.',
        action: 'Schedule focused blocks',
      });
    }

    setSuggestions(suggestionsList);
  };

  if (suggestions.length === 0) return null;

  return (
    <div className={`${CARD_STYLE} bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200`}>
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-bold text-slate-900">Priority Management</h3>
      </div>
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border-2 ${
              suggestion.type === 'alert'
                ? 'bg-red-50 border-red-200'
                : suggestion.type === 'warning'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start gap-2">
              {suggestion.type === 'alert' ? (
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 mb-1">
                  {suggestion.message}
                </p>
                <p className="text-xs text-slate-600">
                  💡 {suggestion.action}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

