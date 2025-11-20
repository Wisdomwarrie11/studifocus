import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, CheckSquare } from 'lucide-react';

const FocusTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isWorkMode, setIsWorkMode] = useState(true); // true = work, false = break

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Switch modes automatically for demo purposes
      if (isWorkMode) {
        setTimeLeft(5 * 60); // 5 min break
        setIsWorkMode(false);
      } else {
        setTimeLeft(25 * 60); // Back to work
        setIsWorkMode(true);
      }
      // In a real app, play a sound here
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isWorkMode]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setIsWorkMode(true);
    setTimeLeft(25 * 60);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto md:ml-64 mt-16 md:mt-0">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Deep Work Session</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Timer Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 flex flex-col items-center justify-center relative overflow-hidden min-h-[300px]">
          <div className={`absolute top-0 left-0 w-full h-2 ${isWorkMode ? 'bg-red-500' : 'bg-green-500'}`}></div>
          
          <span className={`text-sm font-bold uppercase tracking-widest mb-4 ${isWorkMode ? 'text-red-500' : 'text-green-500'}`}>
            {isWorkMode ? 'Focus Time' : 'Break Time'}
          </span>
          
          <div className="text-6xl md:text-8xl font-mono font-bold text-gray-800 mb-8 tracking-tighter">
            {formatTime(timeLeft)}
          </div>

          <div className="flex space-x-6">
            <button 
              onClick={toggleTimer}
              className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 shadow-lg transition-transform active:scale-95"
            >
              {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
            </button>
            <button 
              onClick={resetTimer}
              className="w-16 h-16 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <RotateCcw size={24} />
            </button>
          </div>
        </div>

        {/* Focus Checklist */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <CheckSquare className="mr-2 text-indigo-600" size={20} />
            Pre-Flight Checklist
          </h3>
          <div className="space-y-4">
            {['Phone on Silent / Do Not Disturb', 'Water bottle on desk', 'Clear specific goal defined', 'Comfortable environment'].map((item, idx) => (
              <label key={idx} className="flex items-center space-x-3 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-600" />
                <span className="text-gray-600 group-hover:text-gray-900 text-sm md:text-base">{item}</span>
              </label>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <h4 className="text-sm font-bold text-indigo-800 mb-1">Pro Tip:</h4>
            <p className="text-xs text-indigo-700">
              If you get distracted, write the distraction down on a piece of paper and immediately return to work. Don't engage with it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusTimer;