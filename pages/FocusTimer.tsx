import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckSquare, PenTool, Zap, Plus, Save, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';

const FocusTimer: React.FC = () => {
  const { user, completeFocusCheck, dailyGoals, toggleGoal, addGoal, flashCards, addFlashCard, submitDailyNote } = useApp();

  // Timer State (restore from localStorage if exists)
  const savedTime = localStorage.getItem('focusTimeLeft');
  const savedMode = localStorage.getItem('focusIsWorkMode');
  const savedActive = localStorage.getItem('focusIsActive');

  const [timeLeft, setTimeLeft] = useState<number>(savedTime ? Number(savedTime) : 25 * 60);
  const [isActive, setIsActive] = useState<boolean>(savedActive === 'true' ? true : false);
  const [isWorkMode, setIsWorkMode] = useState<boolean>(savedMode === 'false' ? false : true);

  // Goals & Notes State
  const [newGoalText, setNewGoalText] = useState('');
  const [dailyNote, setDailyNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  // Flashcards
  const [newCardQ, setNewCardQ] = useState('');
  const [newCardInterval, setNewCardInterval] = useState<'hourly' | 'daily'>('hourly');

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer logic
  useEffect(() => {
    localStorage.setItem('focusTimeLeft', timeLeft.toString());
    localStorage.setItem('focusIsWorkMode', isWorkMode.toString());
    localStorage.setItem('focusIsActive', isActive.toString());

    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((time) => time - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (isWorkMode) {
        completeFocusCheck(); // +2 pts
        alert('✅ Focus session completed! +2 pts');
        setTimeLeft(5 * 60);
        setIsWorkMode(false);
      } else {
        setTimeLeft(25 * 60);
        setIsWorkMode(true);
      }
    }

    return () => interval && clearInterval(interval);
  }, [isActive, timeLeft, isWorkMode, completeFocusCheck]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setIsWorkMode(true);
    setTimeLeft(25 * 60);
  };

  // Goals
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoalText.trim()) {
      addGoal(newGoalText);
      setNewGoalText('');
    }
  };

  // Notes
  const handleSaveNote = () => {
    if (dailyNote.trim()) {
      submitDailyNote(dailyNote);
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 3000);
      setDailyNote('');
    }
  };

  // Flashcards
  const handleAddFlashcard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCardQ.trim()) {
      addFlashCard(newCardQ, newCardInterval);
      setNewCardQ('');
      alert('Flashcard added!');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Virtual Study Room</h1>
      <p className="text-gray-500 mb-8">Your personal space for deep work and reflection.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timer + Notes */}
        <div className="lg:col-span-2 space-y-8">
          {/* Timer Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 flex flex-col items-center justify-center relative overflow-hidden min-h-[300px]">
            <div className={`absolute top-0 left-0 w-full h-2 ${isWorkMode ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <span className={`text-sm font-bold uppercase tracking-widest mb-4 ${isWorkMode ? 'text-red-500' : 'text-green-500'}`}>
              {isWorkMode ? 'Deep Focus' : 'Break Time'}
            </span>
            <div className="text-6xl md:text-8xl font-mono font-bold text-gray-800 mb-8 tracking-tighter">
              {formatTime(timeLeft)}
            </div>

            <div className="flex space-x-6">
              <button onClick={toggleTimer} className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 shadow-lg transition-transform active:scale-95">
                {isActive ? <Pause size={28} /> : <Play size={28} />}
              </button>
              <button onClick={resetTimer} className="w-16 h-16 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <RotateCcw size={24} />
              </button>
            </div>
            <p className="mt-6 text-gray-400 text-sm flex items-center">
              <Zap size={14} className="mr-1 text-yellow-500" /> Earn 2 pts per completed session
            </p>
          </div>

          {/* Daily Note */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
              <PenTool className="mr-2 text-indigo-600" size={20} /> What did you learn today?
            </h3>
            <textarea
              className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none resize-none h-32"
              placeholder="Summarize your key takeaways..."
              value={dailyNote}
              onChange={(e) => setDailyNote(e.target.value)}
            />
            <div className="flex justify-end mt-3">
              <button onClick={handleSaveNote} className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-all">
                <Save size={16} className="mr-2" /> {noteSaved ? 'Saved!' : 'Submit to Journal'}
              </button>
            </div>
          </div>
        </div>

        {/* Goals + Flashcards */}
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
      </div>
    </div>
  );
};

export default FocusTimer;
