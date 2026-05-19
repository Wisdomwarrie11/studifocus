import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Zap } from "lucide-react";
import { useApp } from "../context/AppContext";

const TimerCard: React.FC = () => {
  const { addActivity, completeFocusCheck } = useApp();

  const savedTime = localStorage.getItem("focusTimeLeft");
  const savedMode = localStorage.getItem("focusIsWorkMode");
  const savedActive = localStorage.getItem("focusIsActive");

  const [timeLeft, setTimeLeft] = useState<number>(
    savedTime ? Number(savedTime) : 25 * 60,
  );
  const [isActive, setIsActive] = useState<boolean>(
    savedActive === "true" ? true : false,
  );
  const [isWorkMode, setIsWorkMode] = useState<boolean>(
    savedMode === "false" ? false : true,
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    localStorage.setItem("focusTimeLeft", timeLeft.toString());
    localStorage.setItem("focusIsWorkMode", isWorkMode.toString());
    localStorage.setItem("focusIsActive", isActive.toString());

    let interval: number | null = null;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(
        () => setTimeLeft((time) => time - 1),
        1000,
      );
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (isWorkMode) {
        completeFocusCheck();
        if (addActivity) addActivity("focus", { duration: 25 * 60 }, 25 * 60);

        alert("✅ Focus session completed! +2 pts");
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
  }, [isActive, timeLeft, isWorkMode, completeFocusCheck, addActivity]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setIsWorkMode(true);
    setTimeLeft(25 * 60);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 flex flex-col items-center justify-center relative overflow-hidden min-h-[300px]">
      <div
        className={`absolute top-0 left-0 w-full h-2 ${isWorkMode ? "bg-red-500" : "bg-green-500"}`}
      ></div>
      <span
        className={`text-sm font-bold uppercase tracking-widest mb-4 ${isWorkMode ? "text-red-500" : "text-green-500"}`}
      >
        {isWorkMode ? "Deep Focus" : "Break Time"}
      </span>
      <div className="text-6xl md:text-8xl font-mono font-bold text-gray-800 mb-8 tracking-tighter">
        {formatTime(timeLeft)}
      </div>

      <div className="flex space-x-6">
        <button
          onClick={toggleTimer}
          className="w-16 h-16 rounded-full bg-deep-blue text-white flex items-center justify-center hover:bg-deep-blue/90 shadow-lg transition-transform active:scale-95"
        >
          {isActive ? <Pause size={28} /> : <Play size={28} />}
        </button>
        <button
          onClick={resetTimer}
          className="w-16 h-16 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <RotateCcw size={24} />
        </button>
      </div>
      <p className="mt-6 text-gray-400 text-sm flex items-center">
        <Zap size={14} className="mr-1 text-brand-orange" /> Earn 2 pts
        per completed session
      </p>
    </div>
  );
};

export default TimerCard;
