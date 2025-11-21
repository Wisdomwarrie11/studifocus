import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getMotivationalCoach } from '../services/geminiService';
import { CheckCircle, Circle, Flame, Trophy, ArrowRight, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
  const { user, dailyGoals, toggleGoal, addGoal, weeks, announcements } = useApp();
  const [coachMessage, setCoachMessage] = useState<string>("Analyzing your performance...");
  const [newGoalText, setNewGoalText] = useState("");
  const navigate = useNavigate();

  const activeWeek = weeks.find(w => w.isUnlocked && w.topics.some(t => !user?.completedTopics.includes(t.id))) || weeks[0];
  const todaysTopic = activeWeek?.topics.find(t => !user?.completedTopics.includes(t.id)) || activeWeek?.topics[activeWeek.topics.length - 1];

  useEffect(() => {
    if (user) {
      getMotivationalCoach(
        user.name, 
        user.streak, 
        user.points, 
        "Logged in today, checking dashboard"
      ).then(setCoachMessage);
    }
  }, [user]);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoalText.trim()) {
      addGoal(newGoalText);
      setNewGoalText("");
    }
  };

  if (!user) return null;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Announcement Section */}
      {announcements.length > 0 && (
        <div className="mb-8 space-y-2">
          {announcements.map((announcement, idx) => (
            <div key={idx} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-xl flex items-start space-x-3">
              <div className="mt-1">
                <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-8-4a1 1 0 00-.993.883L9 7v4a1 1 0 001.993.117L11 11V7a1 1 0 00-1-1zm0 8a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-yellow-800 font-semibold text-sm md:text-base">Announcement</p>
                <p className="text-yellow-700 text-sm md:text-base">{announcement.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header & AI Coach */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-4 md:gap-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Hello, {user.name.split(' ')[0]}</h1>
            <p className="text-gray-500 text-sm md:text-base">Ready to crush your goals today?</p>
          </div>
          <Link
            to="/roadmap"
            className="hidden md:flex items-center text-indigo-600 font-semibold hover:text-indigo-700"
          >
            View Full Roadmap <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
    
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-indigo-200 font-semibold text-xs md:text-sm uppercase tracking-wider mb-1">
              AI Accountability Coach
            </h3>
            <p className="text-lg md:text-2xl font-medium leading-relaxed">"{coachMessage}"</p>
          </div>
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
            <Flame size={200} />
          </div>
        </div>
      </div>
    
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                <Flame size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Streak</p>
                <p className="text-xl font-bold text-gray-800">{user.streak} Days</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <Trophy size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Points</p>
                <p className="text-xl font-bold text-gray-800">{user.points}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
               <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Done</p>
                <p className="text-xl font-bold text-gray-800">{user.completedTopics.length} Topics</p>
              </div>
            </div>
          </div>
      
          {/* Today's Topic Card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-8">
             <h3 className="text-lg font-bold text-gray-700 mb-4">Today's Focus</h3>
             {todaysTopic ? (
               <>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{todaysTopic.title}</h2>
                <p className="text-gray-600 mb-6 text-sm md:text-base">{todaysTopic.description}</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/study"
                    className="flex-1 bg-indigo-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 flex items-center justify-center space-x-2"
                  >
                    <span>Start Deep Work Session</span>
                    <ArrowRight size={18} />
                  </Link>
                  <button
                    onClick={() => navigate('/roadmap')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                  >
                    See Roadmap
                  </button>
                </div>
               </>
             ) : (
               <div className="text-center py-8">
                 <p className="text-gray-500">You're all caught up!</p>
                 <Link to="/roadmap" className="text-indigo-600 font-semibold mt-2 inline-block">Review Roadmap</Link>
               </div>
             )}
          </div>
        </div>
    
        {/* Right Column: Daily Goals */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 h-fit">
          <h3 className="text-lg font-bold text-gray-700 mb-4">Daily Micro-Goals</h3>
          <div className="space-y-3 mb-6">
            {dailyGoals.map(goal => (
              <div key={goal.id} className="flex items-start space-x-3 group cursor-pointer" onClick={() => toggleGoal(goal.id)}>
                <div className={`mt-1 transition-colors ${goal.completed ? 'text-green-500' : 'text-gray-300 group-hover:text-gray-400'}`}>
                  {goal.completed ? <CheckCircle size={20} fill="currentColor" className="text-white" /> : <Circle size={20} />}
                </div>
                <p className={`text-sm md:text-base transition-all ${goal.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                  {goal.text}
                </p>
              </div>
            ))}
          </div>
          
          <form onSubmit={handleAddGoal} className="flex items-center space-x-2 border-t border-gray-100 pt-4">
            <input 
              type="text" 
              placeholder="Add a new goal..." 
              className="flex-1 text-sm border-none outline-none bg-transparent"
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
            />
            <button type="submit" className="text-indigo-600 bg-indigo-50 p-2 rounded-lg hover:bg-indigo-100 transition-colors">
              <Plus size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
