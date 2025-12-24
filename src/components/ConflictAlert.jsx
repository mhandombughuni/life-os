import React from 'react';
import { AlertCircle, X, Clock } from 'lucide-react';

export default function ConflictAlert({ conflicts }) {
  if (!conflicts || conflicts.length === 0) return null;

  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-red-900 mb-2">Schedule Conflict Detected</h4>
          {conflicts.map((conflict, index) => (
            <div key={index} className="mb-2 text-sm text-red-700">
              <p>
                <strong>{conflict.scheduleItem.label}</strong> conflicts with{' '}
                <strong>{conflict.calendarEvent.summary || conflict.calendarEvent.title}</strong>
              </p>
              <p className="text-xs text-red-600 mt-1">
                Both scheduled at {conflict.scheduleItem.time}
              </p>
            </div>
          ))}
          <div className="mt-3 p-2 bg-white rounded border border-red-200">
            <p className="text-xs text-red-800">
              <strong>Suggestion:</strong> Reschedule one of these activities or combine them if possible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

