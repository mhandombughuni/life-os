import React, { useState } from 'react';
import { X, MessageCircle, Send, User, Bot, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AIGoalDialogue({ goals, onClose }) {
  const { user } = useApp();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${user?.name || 'there'}! I'm your AI coach. I can help you break down your goals into actionable steps. Which goal would you like to work on?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMessage = {
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    // Simulate AI response (in production, call backend AI service)
    setTimeout(() => {
      const response = generateAIResponse(input, goals);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsThinking(false);
    }, 1500);
  };

  const generateAIResponse = (userInput, userGoals) => {
    const input = userInput.toLowerCase();

    // Goal-specific responses
    if (input.includes('goal') || input.includes('target')) {
      const goal = userGoals[0];
      if (goal) {
        return `Great! Let's work on "${goal.name}". Here's a step-by-step plan:

1. **Break it down**: Divide your goal into smaller milestones
2. **Set deadlines**: Create quarterly targets
3. **Track progress**: Update your progress weekly
4. **Adjust**: Review and adjust monthly

Would you like me to help you create specific action steps for this goal?`;
      }
    }

    // Revenue/income goals
    if (input.includes('revenue') || input.includes('income') || input.includes('money')) {
      return `For revenue goals, here's a strategic approach:

**Q1**: Focus on lead generation and pipeline building
- Identify top 3 revenue sources
- Set up tracking systems
- Build relationships with key clients

**Q2**: Optimize conversion and pricing
- Analyze what's working
- Adjust pricing strategy
- Increase deal sizes

**Q3**: Scale successful channels
- Double down on what works
- Expand to new markets
- Build partnerships

**Q4**: Review and plan for next year
- Analyze full year performance
- Set new targets
- Celebrate wins!

Would you like me to help you create specific quarterly activities?`;
    }

    // Help/confusion
    if (input.includes('help') || input.includes('stuck') || input.includes('don\'t know')) {
      return `I understand! Let's start simple:

1. **What's your biggest goal right now?** (e.g., increase income, improve work-life balance)
2. **What's your current situation?** (e.g., where are you now?)
3. **What's your target?** (e.g., where do you want to be?)

Once we have these, I can create a personalized action plan. If you need deeper guidance, I can connect you with a human coach.

What would you like to focus on?`;
    }

    // Default response
    return `I'm here to help you achieve your goals! I can:
- Break down goals into actionable steps
- Create quarterly activity plans
- Suggest strategies based on your situation
- Help you stay focused and avoid overwhelm

What specific goal or challenge would you like to work on? If you need deeper support, I can connect you with a human coach.`;
  };

  const suggestHumanCoach = () => {
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `For deeper guidance and personalized coaching, I recommend connecting with a human coach who can:
- Provide personalized strategies
- Help with complex situations
- Offer accountability and support
- Guide you through challenges

Would you like me to help you find a coach?`,
    }]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">AI Goal Coach</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
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
              <div className="bg-slate-100 rounded-2xl p-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me about your goals..."
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={suggestHumanCoach}
            className="mt-2 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Need deeper help? Connect with a human coach <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

