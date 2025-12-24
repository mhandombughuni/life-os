import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { dataService } from '../services/dataService';
import { CheckCircle, Circle, Plus, Trash2, Target, Calendar } from 'lucide-react';

const CARD_STYLE = "bg-white p-6 rounded-2xl shadow-md border border-slate-200 hover:shadow-lg transition-shadow";

export default function TodoList() {
  const { user, currentDate, updateHabits } = useApp();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState('medium');
  const [suggestedTodos, setSuggestedTodos] = useState([]);

  useEffect(() => {
    if (user) {
      loadTodos();
      loadSuggestedTodos();
    }
  }, [user, currentDate]);

  const loadTodos = () => {
    if (!user) return;
    const todosData = dataService.getTodos(user.id, currentDate);
    setTodos(todosData || []);
  };

  const loadSuggestedTodos = () => {
    if (!user) return;
    // Get suggestions from calendar, goals, and habits
    const profile = dataService.getUserProfile(user.id);
    const goals = dataService.getGoals(user.id);
    const habits = dataService.getHabits(user.id, currentDate);
    
    const suggestions = [];
    
    // Suggest based on goals
    goals.forEach(goal => {
      if (goal.current_value < goal.target_value) {
        suggestions.push({
          text: `Work on: ${goal.name}`,
          source: 'goal',
          priority: 'high',
        });
      }
    });
    
    // Suggest based on incomplete habits
    if (habits) {
      Object.entries(habits).forEach(([key, completed]) => {
        if (!completed) {
          suggestions.push({
            text: `Complete: ${key.replace(/_/g, ' ')}`,
            source: 'habit',
            priority: 'medium',
          });
        }
      });
    }
    
    setSuggestedTodos(suggestions);
  };

  const saveTodos = (updatedTodos) => {
    if (!user) return;
    dataService.saveTodos(user.id, currentDate, updatedTodos);
    
    // Update habit tracker if todo is linked to a habit
    updatedTodos.forEach(todo => {
      if (todo.completed && todo.linkedHabit) {
        const habits = dataService.getHabits(user.id, currentDate) || {};
        habits[todo.linkedHabit] = true;
        updateHabits(currentDate, habits);
      }
    });
  };

  const addTodo = () => {
    if (!newTodo.trim()) return;
    
    const todo = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
      priority: newTodoPriority,
      createdAt: new Date().toISOString(),
      linkedHabit: null,
    };
    
    const updated = [...todos, todo];
    setTodos(updated);
    saveTodos(updated);
    setNewTodo('');
    setNewTodoPriority('medium');
  };

  const toggleTodo = (id) => {
    const updated = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updated);
    saveTodos(updated);
    
    // Update milestone progress
    updateMilestoneProgress(updated);
  };

  const deleteTodo = (id) => {
    const updated = todos.filter(todo => todo.id !== id);
    setTodos(updated);
    saveTodos(updated);
  };

  const addSuggestedTodo = (suggestion) => {
    const todo = {
      id: Date.now().toString(),
      text: suggestion.text,
      completed: false,
      priority: suggestion.priority,
      createdAt: new Date().toISOString(),
      linkedHabit: suggestion.source === 'habit' ? suggestion.text.split(': ')[1] : null,
    };
    
    const updated = [...todos, todo];
    setTodos(updated);
    saveTodos(updated);
    
    // Remove from suggestions
    setSuggestedTodos(suggestedTodos.filter(s => s.text !== suggestion.text));
  };

  const updateMilestoneProgress = (todos) => {
    if (!user) return;
    
    const completedCount = todos.filter(t => t.completed).length;
    const totalCount = todos.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    
    // Update daily milestone
    const milestones = dataService.getMilestones(user.id);
    const dailyMilestone = milestones.find(m => m.category === 'daily');
    
    if (dailyMilestone) {
      const updated = milestones.map(m => 
        m.id === dailyMilestone.id 
          ? { ...m, progress: Math.min(progress, 100) }
          : m
      );
      dataService.saveMilestones(user.id, updated);
    }
  };

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className={CARD_STYLE}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-500" /> Daily To-Do List
        </h3>
        <div className="text-sm text-slate-500">
          {completedCount}/{totalCount} completed
        </div>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="mb-4">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="text-xs text-slate-500 mt-1 text-right">
            {Math.round(completionRate)}% complete
          </div>
        </div>
      )}

      {/* Suggested Todos */}
      {suggestedTodos.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xs font-semibold text-blue-700 mb-2">Suggested Tasks:</div>
          <div className="flex flex-wrap gap-2">
            {suggestedTodos.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => addSuggestedTodo(suggestion)}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              >
                + {suggestion.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Todo */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a task..."
          className="flex-1 min-w-0 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        <select
          value={newTodoPriority}
          onChange={(e) => setNewTodoPriority(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button
          onClick={addTodo}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Todo List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {todos.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No tasks yet. Add your first task above!
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                todo.completed
                  ? 'bg-green-50 border-green-200'
                  : todo.priority === 'high'
                  ? 'bg-red-50 border-red-200'
                  : todo.priority === 'medium'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                className="flex-shrink-0"
              >
                {todo.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400" />
                )}
              </button>
              <span
                className={`flex-1 ${
                  todo.completed
                    ? 'line-through text-slate-500'
                    : 'text-slate-900'
                }`}
              >
                {todo.text}
              </span>
              {todo.priority === 'high' && !todo.completed && (
                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                  High
                </span>
              )}
              <button
                onClick={() => deleteTodo(todo.id)}
                className="p-1 hover:bg-red-100 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

