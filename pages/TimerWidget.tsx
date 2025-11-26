import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Zap, PenTool, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatTime } from './utils/timeUtils';

const TimerWidget: React.FC = () => {
  const { completeFocusCheck, submitDailyNote } = useApp();

  // Timer State (restore from localStorage if exists)
  const savedTime = localStorage.getItem('focusTimeLeft');
  const savedMode = localStorage.getItem('focusIsWorkMode');
  const savedActive = localStorage.getItem('focusIsActive');

  const [timeLeft, setTimeLeft] = useState<number>(savedTime ? Number(savedTime) : 25 * 60);
  const [isActive, setIsActive] = useState<boolean>(savedActive === 'true' ? true : false);
  const [isWorkMode, setIsWorkMode] = useState<boolean>(savedMode === 'false' ? false : true);

  // Notes State
  const [dailyNote, setDailyNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  // Timer logic
  useEffect(() => {
    localStorage.setItem('focusTimeLeft', timeLeft.toString());
    localStorage.setItem('focusIsWorkMode', isWorkMode.toString());
    localStorage.setItem('focusIsActive', isActive.toString());

    let interval: number | null = null;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => setTimeLeft((time) => time - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (isWorkMode) {
        completeFocusCheck(); 
        alert('✅ Focus session completed! +2 pts');
        setTimeLeft(5 * 60);
        setIsWorkMode(false);
      } else {
        setTimeLeft(25 * 60);
        setIsWorkMode(true);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, isWorkMode, completeFocusCheck]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setIsWorkMode(true);
    setTimeLeft(25 * 60);
  };

  const handleSaveNote = () => {
    if (dailyNote.trim()) {
      submitDailyNote(dailyNote);
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 3000);
      setDailyNote('');
    }
  };

  return (
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
  );
};

export default TimerWidget;
