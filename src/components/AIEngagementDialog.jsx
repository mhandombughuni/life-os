import React, { useState, useEffect } from 'react';
import { X, Bot, Send, Globe, TrendingUp, Lightbulb } from 'lucide-react';
import { proactiveAIService } from '../services/proactiveAIService';
import { useApp } from '../context/AppContext';
import { dataService } from '../services/dataService';

export default function AIEngagementDialog({ goal, onClose, onComplete }) {
  const { user } = useApp();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    if (goal) {
      loadEngagement();
    }
  }, [goal]);

  const loadEngagement = async () => {
    setLoading(true);
    try {
      const profile = dataService.getUserProfile(user.id);
      const engagement = await proactiveAIService.analyzeGoal(goal, profile);
      
      if (engagement && engagement.questions && engagement.questions.length > 0) {
        setQuestions(engagement.questions);
        setInitialMessage(engagement.initialMessage || `Let's analyze your goal: "${goal.name}"`);
      } else {
        setError('Could not generate questions for this goal.');
      }
    } catch (err) {
      setError('Failed to load AI engagement: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = () => {
    if (!currentAnswer.trim()) return;
    
    const question = getCurrentQuestion();
    if (!question) return;
    
    const newAnswers = {
      ...answers,
      [question.field]: currentAnswer,
    };
    setAnswers(newAnswers);
    setCurrentAnswer('');
    
    // Move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered, analyze
      handleComplete(newAnswers);
    }
  };

  const handleComplete = async (allAnswers) => {
    setIsAnalyzing(true);
    
    // Analyze website if provided
    if (allAnswers.businessWebsite) {
      const websiteAnalysis = await proactiveAIService.analyzeBusinessWebsite(allAnswers.businessWebsite);
      if (websiteAnalysis) {
        allAnswers.websiteAnalysis = websiteAnalysis;
      }
    }
    
    // Save analysis
    proactiveAIService.saveGoalAnalysis(user.id, goal.id, allAnswers);
    
    // Generate recommendations
    const recs = await proactiveAIService.generateStrategicRecommendations(user.id);
    setRecommendations(recs);
    setShowRecommendations(true);
    setIsAnalyzing(false);
    
    if (onComplete) {
      onComplete(allAnswers);
    }
  };


  const getCurrentQuestion = () => {
    return questions[currentQuestionIndex];
  };

  const currentQuestion = getCurrentQuestion();

  if (showRecommendations) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-slate-900">AI Strategic Recommendations</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {recommendations.map((rec, index) => (
              <div key={index} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{rec.goalName}</h3>
                {rec.strategies.map((strategy, sIndex) => (
                  <div key={sIndex} className="mb-4 last:mb-0">
                    <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" /> {strategy.title}
                    </h4>
                    <p className="text-slate-600 text-sm mb-3">{strategy.description}</p>
                    <ul className="space-y-1">
                      {strategy.actions.map((action, aIndex) => (
                        <li key={aIndex} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-purple-600 mt-1">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-slate-700">Loading AI analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-red-600">Error</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion || questions.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">AI Goal Analysis</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-500 mb-2">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-6">
            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <p className="text-lg font-medium text-slate-900">{currentQuestion.question}</p>
            </div>

            {currentQuestion.field === 'businessWebsite' && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  I'll analyze your website to understand your business better and provide tailored recommendations.
                </p>
              </div>
            )}

            <input
              type={currentQuestion.field === 'businessWebsite' ? 'url' : 'text'}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAnswer()}
              placeholder="Your answer..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {currentQuestionIndex > 0 && (
              <button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Back
              </button>
            )}
            <button
              onClick={handleAnswer}
              disabled={!currentAnswer.trim() || isAnalyzing}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                'Analyzing...'
              ) : currentQuestionIndex < questions.length - 1 ? (
                <>
                  Next <Send className="w-4 h-4" />
                </>
              ) : (
                <>
                  Complete Analysis <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

