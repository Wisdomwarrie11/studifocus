import React, { useState } from 'react';
import { CheckSquare, Plus, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';

const GoalsWidget: React.FC = () => {
  const { dailyGoals, toggleGoal, addGoal, flashCards, addFlashCard } = useApp();
  
  const [newGoalText, setNewGoalText] = useState('');
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

        <div className="space-y-3 mb-6">
          {dailyGoals.map((goal) => (
            <div key={goal.id} className="flex items-start space-x-3 group cursor-pointer" onClick={() => toggleGoal(goal.id)}>
              <div className={`mt-1 transition-colors ${goal.completed ? 'text-green-500' : 'text-gray-300 group-hover:text-gray-400'}`}>
                {goal.completed ? <CheckSquare size={20} /> : <div className="w-5 h-5 border-2 border-current rounded" />}
              </div>
              <p className={`text-sm transition-all ${goal.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{goal.text}</p>
            </div>
          ))}
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
