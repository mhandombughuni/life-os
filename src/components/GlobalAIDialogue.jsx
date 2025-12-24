import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MessageCircle, X, Minimize2, Maximize2, Send, Bot, User } from 'lucide-react';
import { proactiveAIService } from '../services/proactiveAIService';
import { dataService } from '../services/dataService';
import AIEngagementDialog from './AIEngagementDialog';

export default function GlobalAIDialogue() {
  const { user } = useApp();
  const [isMinimized, setIsMinimized] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showEngagementDialog, setShowEngagementDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  useEffect(() => {
    if (user && isMinimized === false) {
      // Check for proactive engagement when opened
      checkProactiveEngagement();
    }
  }, [user, isMinimized]);

  const checkProactiveEngagement = () => {
    if (!user) return;
    
    const goals = dataService.getGoals(user.id) || [];
    const goalsNeedingAI = goals.filter(g => !g.aiAnalyzed && 
      (g.name.toLowerCase().includes('million') || 
       g.name.toLowerCase().includes('revenue') || 
       g.name.toLowerCase().includes('company') ||
       g.name.toLowerCase().includes('$')));
    
    if (goalsNeedingAI.length > 0) {
      const goal = goalsNeedingAI[0];
      const engagement = proactiveAIService.analyzeAndEngage(user.id, goal);
      if (engagement && engagement.needsEngagement) {
        setSelectedGoal(goal);
        setShowEngagementDialog(true);
        return;
      }
    }
    
    // Welcome message if no immediate engagement needed
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Hi ${user?.name || 'there'}! I'm your AI coach. I can help you with:
        
• Analyzing your goals and creating strategic plans
• Optimizing your schedule and habits
• Providing personalized recommendations
• Answering questions about your progress

What would you like to work on today?`,
      }]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMessage = {
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    // Call backend AI service
    try {
      const response = await generateAIResponse(input, user);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const generateAIResponse = async (userInput, userData) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    
    try {
      // Call backend LLM service
      const response = await fetch(`${API_BASE_URL}/api/ai/coaching`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userData.id,
          message: userInput,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.message || data.insights?.message || 'I\'m here to help!';
      }
    } catch (error) {
      console.error('AI response error:', error);
    }
    
    // Fallback response
    return `I understand you're asking about "${userInput}". Let me help you with that. Could you provide a bit more context so I can give you the most relevant advice?`;
  };

  return (
    <>
      {/* Minimized Button */}
      {isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 group"
          aria-label="Open AI Coach"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Expanded Dialogue */}
      {!isMinimized && (
        <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col max-h-[600px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-bold">AI Coach</h3>
            </div>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                <Bot className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>Start a conversation with your AI coach</p>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-900 border border-slate-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
            {isThinking && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="bg-white rounded-2xl p-3 border border-slate-200">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 p-4 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isThinking}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Engagement Dialog */}
      {showEngagementDialog && selectedGoal && (
        <AIEngagementDialog
          goal={selectedGoal}
          onClose={() => {
            setShowEngagementDialog(false);
            setSelectedGoal(null);
          }}
          onComplete={() => {
            setShowEngagementDialog(false);
            setSelectedGoal(null);
            checkProactiveEngagement();
          }}
        />
      )}
    </>
  );
}

