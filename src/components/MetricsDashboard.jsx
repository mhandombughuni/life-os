import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  AlertCircle,
  Target,
  Activity,
  BarChart3
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { metricsService } from '../services/metricsService';

const CARD_STYLE = "bg-white p-6 rounded-2xl shadow-sm border border-slate-100";

export default function MetricsDashboard({ insights, userId }) {
  if (!insights) {
    return (
      <div className={CARD_STYLE}>
        <p className="text-slate-500 text-center py-8">
          Start tracking your habits to see insights here!
        </p>
      </div>
    );
  }

  const history = userId ? dataService.getHabitHistory(userId, 7) : [];
  const metricsHistory = userId ? dataService.getMetricsHistory(userId, 7) : [];

  // Calculate streaks
  const getStreaks = () => {
    if (!userId || history.length === 0) return {};
    
    const streaks = {};
    const habitKeys = new Set();
    history.forEach(day => {
      if (day.habits) {
        Object.keys(day.habits).forEach(key => habitKeys.add(key));
      }
    });

    habitKeys.forEach(habitKey => {
      streaks[habitKey] = metricsService.calculateStreak(userId, habitKey, history);
    });

    return streaks;
  };

  const streaks = getStreaks();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average Score */}
        <div className={`${CARD_STYLE} border-l-4 border-blue-500`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-600">Weekly Average</h3>
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {insights.trends.averageScore}
            <span className="text-lg text-slate-400">/100</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {insights.trends.direction === 'improving' ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">Improving</span>
              </>
            ) : insights.trends.direction === 'declining' ? (
              <>
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600">Needs attention</span>
              </>
            ) : (
              <span className="text-sm text-slate-500">Stable</span>
            )}
          </div>
        </div>

        {/* Best Day */}
        {insights.trends.bestDay && (
          <div className={`${CARD_STYLE} border-l-4 border-green-500`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-600">Best Day</h3>
              <Award className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {insights.trends.bestDay.score}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {new Date(insights.trends.bestDay.date).toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
        )}

        {/* Active Streaks */}
        <div className={`${CARD_STYLE} border-l-4 border-purple-500`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-600">Active Streaks</h3>
            <Activity className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-purple-600">
            {Object.values(streaks).filter(s => s > 0).length}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {Math.max(...Object.values(streaks), 0)} day longest streak
          </p>
        </div>
      </div>

      {/* Strengths */}
      {insights.strengths.length > 0 && (
        <div className={CARD_STYLE}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-green-700">
            <TrendingUp className="w-5 h-5" /> What's Going Well
          </h3>
          <div className="space-y-3">
            {insights.strengths.map((strength, index) => (
              <div key={index} className="bg-green-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-green-900 capitalize">
                    {strength.habit.replace(/_/g, ' ')}
                  </span>
                  <span className="text-green-700 font-bold">
                    {strength.completionRate}%
                  </span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${strength.completionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvements */}
      {insights.improvements.length > 0 && (
        <div className={CARD_STYLE}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-orange-700">
            <AlertCircle className="w-5 h-5" /> Areas to Improve
          </h3>
          <div className="space-y-3">
            {insights.improvements.map((improvement, index) => (
              <div key={index} className="bg-orange-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-orange-900 capitalize">
                    {improvement.habit.replace(/_/g, ' ')}
                  </span>
                  <span className="text-orange-700 font-bold">
                    {improvement.completionRate}%
                  </span>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full"
                    style={{ width: `${improvement.completionRate}%` }}
                  />
                </div>
                <p className="text-xs text-orange-600 mt-2">
                  💡 Tip: Try scheduling this habit at a consistent time each day
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streaks Detail */}
      {Object.keys(streaks).length > 0 && (
        <div className={CARD_STYLE}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" /> Current Streaks
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(streaks)
              .filter(([_, streak]) => streak > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([habit, streak]) => (
                <div key={habit} className="bg-blue-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {streak}
                  </div>
                  <div className="text-xs text-blue-700 font-medium capitalize">
                    {habit.replace(/_/g, ' ')}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">day streak 🔥</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Weekly Trend Chart */}
      {metricsHistory.length > 0 && (
        <div className={CARD_STYLE}>
          <h3 className="text-lg font-bold mb-4">7-Day Trend</h3>
          <div className="flex items-end justify-between gap-2 h-48">
            {metricsHistory.slice().reverse().map((metric, index) => {
              const height = ((metric.score || 0) / 100) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center" style={{ height: '160px' }}>
                    <div 
                      className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                      style={{ height: `${height}%` }}
                      title={`${metric.score || 0}% on ${new Date(metric.date).toLocaleDateString()}`}
                    />
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(metric.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

