import React, { useState } from 'react';
import { CheckSquare, Plus, Bell, Trash2, Edit2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const GoalsWidget: React.FC = () => {
  const { dailyGoals, toggleGoal, addGoal, editGoal, deleteGoal, flashCards, addFlashCard } = useApp();
  
  const [newGoalText, setNewGoalText] = useState('');
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [newCardQ, setNewCardQ] = useState('');
  const [newCardInterval, setNewCardInterval] = useState<'hourly' | 'daily'>('hourly');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoalText.trim()) {
      addGoal(newGoalText);
      setNewGoalText('');
    }
  };

  const handleAddFlashcard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCardQ.trim()) {
      addFlashCard(newCardQ, newCardInterval);
      setNewCardQ('');
      alert('Flashcard added!');
    }
  };

  return (
    <div className="space-y-8">
      {/* Daily Goals */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-700 mb-1">Daily Micro-Goals</h3>
        <p className="text-xs text-gray-400 mb-4">Check off to earn 10 pts each!</p>

        <div className="space-y-2 mb-6">
          {dailyGoals.map((goal) => (
            <div key={goal.id}>
              {editingGoalId === goal.id ? (
                <form 
                  onSubmit={(e) => { 
                    e.preventDefault(); 
                    if (editingText.trim()) { 
                      editGoal(goal.id, editingText); 
                      setEditingGoalId(null); 
                    } 
                  }} 
                  className="flex items-center space-x-2 py-1"
                >
                  <input 
                    type="text" 
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1 outline-none ring-1 ring-indigo-500" 
                    value={editingText} 
                    onChange={(e) => setEditingText(e.target.value)} 
                    autoFocus 
                  />
                  <button type="submit" className="text-white bg-indigo-600 font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">Save</button>
                  <button type="button" onClick={() => setEditingGoalId(null)} className="text-gray-500 bg-gray-100 font-medium text-xs px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                </form>
              ) : (
                <div className="flex items-center justify-between group py-1.5 px-2 rounded-xl hover:bg-gray-50/80 border border-transparent transition-all">
                  <div className="flex items-start space-x-3 cursor-pointer flex-1 min-w-0" onClick={() => toggleGoal(goal.id)}>
                    <div className={`mt-0.5 transition-colors flex-shrink-0 ${goal.completed ? 'text-green-500' : 'text-gray-300 group-hover:text-gray-400'}`}>
                      {goal.completed ? <CheckSquare size={20} /> : <div className="w-5 h-5 border-2 border-current rounded" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm break-words ${goal.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{goal.text}</p>
                      {goal.createdAt && (
                        <span className="text-[10px] text-gray-400 block font-mono mt-0.5">Set on: {new Date(goal.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingGoalId(goal.id); setEditingText(goal.text); }}
                      className="p-1 hover:text-indigo-600 text-gray-400 rounded transition-colors"
                      title="Edit goal"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); if (confirm('Delete this goal?')) deleteGoal(goal.id); }}
                      className="p-1 hover:text-red-600 text-gray-400 rounded transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {dailyGoals.length === 0 && <p className="text-sm text-gray-400 italic">No goals set for today yet.</p>}
        </div>

        <form onSubmit={handleAddGoal} className="flex items-center space-x-2 border-t border-gray-100 pt-4">
          <input type="text" placeholder="Add goal..." className="flex-1 text-sm border-none outline-none bg-transparent" value={newGoalText} onChange={(e) => setNewGoalText(e.target.value)} />
          <button type="submit" className="text-indigo-600 bg-indigo-50 p-2 rounded-lg hover:bg-indigo-100 transition-colors">
            <Plus size={16} />
          </button>
        </form>
      </div>

      {/* Flashcards */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
          <Bell className="mr-2 text-yellow-500" size={20} /> Flashcard Reminders
        </h3>

        <div className="space-y-4 mb-6 max-h-48 overflow-y-auto">
          {flashCards.map((card) => (
            <div key={card.id} className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
              <p className="text-sm font-medium text-gray-800">{card.text}</p>
              <p className="text-xs text-gray-500 mt-1 uppercase">{card.interval}</p>
            </div>
          ))}
          {flashCards.length === 0 && <p className="text-sm text-gray-400 italic">No reminders set.</p>}
        </div>

        <form onSubmit={handleAddFlashcard} className="space-y-3 border-t border-gray-100 pt-4">
          <input type="text" placeholder="Reminder note..." className="w-full text-sm border border-gray-200 rounded p-2" value={newCardQ} onChange={(e) => setNewCardQ(e.target.value)} />
          <div className="flex gap-2">
            <select className="text-sm border border-gray-200 rounded p-2 flex-1" value={newCardInterval} onChange={(e) => setNewCardInterval(e.target.value as 'hourly' | 'daily')}>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
            </select>
            <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded text-sm font-bold">Set</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalsWidget;
