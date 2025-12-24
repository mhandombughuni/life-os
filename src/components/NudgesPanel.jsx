import React from 'react';
import { Lightbulb, TrendingUp, Clock, Award, AlertCircle } from 'lucide-react';

const PRIORITY_COLORS = {
  high: 'bg-red-50 border-red-200 text-red-800',
  medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  low: 'bg-blue-50 border-blue-200 text-blue-800',
};

const TYPE_ICONS = {
  morning: Clock,
  improvement: TrendingUp,
  streak: Award,
  'optimal-time': Clock,
  encouragement: Lightbulb,
};

export default function NudgesPanel({ nudges }) {
  if (!nudges || nudges.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-bold text-slate-900">AI Insights & Nudges</h3>
      </div>
      <div className="space-y-3">
        {nudges.map((nudge, index) => {
          const Icon = TYPE_ICONS[nudge.type] || AlertCircle;
          return (
            <div
              key={index}
              className={`${PRIORITY_COLORS[nudge.priority] || PRIORITY_COLORS.low} rounded-xl p-4 border-2 flex items-start gap-3`}
            >
              <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">{nudge.message}</p>
                {nudge.streak && (
                  <p className="text-xs mt-1 opacity-75">
                    {nudge.streak} day streak
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

