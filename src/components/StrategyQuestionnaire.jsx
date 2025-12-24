import React, { useState } from 'react';
import { Bot, ArrowRight, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function StrategyQuestionnaire({ onComplete }) {
  const { user } = useApp();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    painpoints: [],
    strengths: [],
    limitations: [],
    currentSituation: '',
    desiredOutcome: '',
  });
  const [currentInput, setCurrentInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const questions = [
    {
      key: 'painpoints',
      question: "What are your main pain points or challenges?",
      placeholder: "e.g., Lack of focus, time management issues, overwhelmed...",
      type: 'list',
    },
    {
      key: 'strengths',
      question: "What are your key strengths and capabilities?",
      placeholder: "e.g., Strong communication, technical skills, leadership...",
      type: 'list',
    },
    {
      key: 'limitations',
      question: "What limitations or constraints do you face?",
      placeholder: "e.g., Limited time, budget constraints, lack of resources...",
      type: 'list',
    },
    {
      key: 'currentSituation',
      question: "Describe your current situation in detail:",
      placeholder: "Tell me about where you are now in your career/business/life...",
      type: 'text',
    },
    {
      key: 'desiredOutcome',
      question: "What is your desired outcome or vision?",
      placeholder: "Where do you want to be? What does success look like?",
      type: 'text',
    },
  ];

  const currentQuestion = questions[step];

  const handleAddToList = (key) => {
    if (!currentInput.trim()) return;
    setAnswers(prev => ({
      ...prev,
      [key]: [...prev[key], currentInput.trim()],
    }));
    setCurrentInput('');
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      generateStrategy();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const generateStrategy = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/generate-strategy-from-inputs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          painpoints: answers.painpoints,
          strengths: answers.strengths,
          limitations: answers.limitations,
          current_situation: answers.currentSituation,
          desired_outcome: answers.desiredOutcome,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onComplete(data);
      } else {
        throw new Error('Failed to generate strategy');
      }
    } catch (error) {
      console.error('Strategy generation error:', error);
      // Fallback
      onComplete({
        strategies: [
          { id: '1', title: 'Focus on Core Strengths', description: `Leverage your strengths: ${answers.strengths.join(', ')}` },
        ],
        pillars: answers.strengths.map((s, i) => ({ id: i.toString(), name: s, description: '' })),
        goals: [],
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getAnswerForStep = () => {
    const key = currentQuestion.key;
    if (currentQuestion.type === 'list') {
      return answers[key];
    } else {
      return answers[key] || '';
    }
  };

  const isStepComplete = () => {
    const key = currentQuestion.key;
    if (currentQuestion.type === 'list') {
      return answers[key].length > 0;
    } else {
      return answers[key] && answers[key].trim().length > 0;
    }
  };

  if (isGenerating) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">AI is analyzing your inputs...</h3>
            <p className="text-slate-600 text-sm">
              Generating personalized strategies, pillars, and goals based on your pain points, strengths, and limitations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-900">Let's Build Your Strategy</h2>
        </div>
        <p className="text-slate-600 text-sm">
          Step {step + 1} of {questions.length}
        </p>
        <div className="w-full bg-slate-200 rounded-full h-2 mt-3">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{currentQuestion.question}</h3>

        {currentQuestion.type === 'list' ? (
          <div>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddToList(currentQuestion.key)}
                placeholder={currentQuestion.placeholder}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleAddToList(currentQuestion.key)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>

            {getAnswerForStep().length > 0 && (
              <div className="space-y-2">
                {getAnswerForStep().map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-blue-50 rounded-lg p-3"
                  >
                    <span className="text-slate-800">{item}</span>
                    <button
                      onClick={() => {
                        setAnswers(prev => ({
                          ...prev,
                          [currentQuestion.key]: prev[currentQuestion.key].filter((_, i) => i !== index),
                        }));
                      }}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <textarea
            value={getAnswerForStep()}
            onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.key]: e.target.value }))}
            placeholder={currentQuestion.placeholder}
            rows={6}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={step === 0}
          className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!isStepComplete()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {step === questions.length - 1 ? 'Generate Strategy' : 'Next'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

