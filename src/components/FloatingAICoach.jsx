import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import AIGoalDialogue from './AIGoalDialogue';
import { useApp } from '../context/AppContext';
import { dataService } from '../services/dataService';

export default function FloatingAICoach() {
  const { user } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [goals, setGoals] = React.useState([]);

  React.useEffect(() => {
    if (user) {
      const userGoals = dataService.getGoals(user.id);
      setGoals(userGoals || []);
    }
  }, [user]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 group"
        aria-label="Open AI Coach"
      >
        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
      </button>

      {/* AI Dialogue Modal */}
      {isOpen && (
        <AIGoalDialogue
          goals={goals}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

