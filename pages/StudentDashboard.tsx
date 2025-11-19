
import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getMotivationalCoach } from '../services/geminiService';
import { CheckCircle, Circle, Flame, Trophy, ArrowRight, BookOpen, PlayCircle, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
  const { user, dailyGoals, toggleGoal, addGoal, weeks } = useApp();
  const [coachMessage, setCoachMessage] = useState<string>("Analyzing your performance...");
  const [newGoalText, setNewGoalText] = useState("");
  const navigate = useNavigate();

  // Mock getting "Today's Topic" - assume first unlocked week, first incomplete topic
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
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header & AI Coach */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Hello, {user.name.split(' ')[0]}</h1>
            <p className="text-gray-500">Ready to crush your goals today?</p>
          </div>
          <Link to="/roadmap" className="hidden md:flex items-center text-primary font-semibold hover:text-indigo-700">
            View Full Roadmap <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-indigo-200 font-semibold text-sm uppercase tracking-wider mb-1">AI Accountability Coach</h3>
            <p className="text-xl md:text-2xl font-medium leading-relaxed">"{coachMessage}"</p>
          </div>
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
            <Flame size={200} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Today's Focus */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
              <div className="bg-orange-100 p-2 rounded-lg text-orange-500">
                <Flame size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{user.streak}</p>
                <p className="text-xs text-gray-500 uppercase font-semibold">Day Streak</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-500">
                <Trophy size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{user.points}</p>
                <p className="text-xs text-gray-500 uppercase font-semibold">Total Points</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg text-purple-500">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{user.completedTopics.length}</p>
                <p className="text-xs text-gray-500 uppercase font-semibold">Topics Done</p>
              </div>
            </div>
          </div>

          {/* Today's Topic Card */}
          {todaysTopic ? (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                  <span className="bg-primary w-2 h-2 rounded-full"></span>
                  Today's Focus
                </h2>
                <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-medium">
                  Week {activeWeek?.weekNumber} • Day {todaysTopic.day}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{todaysTopic.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{todaysTopic.description}</p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to="/study"
                    className="flex-1 bg-primary text-white text-center py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 flex items-center justify-center space-x-2"
                  >
                    <span>Start Deep Work Session</span>
                    <ArrowRight size={18} />
                  </Link>
                  <button 
                    onClick={() => navigate('/roadmap')}
                    className="px-6 py-3 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                  >
                    See Roadmap
                  </button>
                </div>

                {/* Recommended Resources */}
                {todaysTopic.resources.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <BookOpen size={14} /> Recommended Resources
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {todaysTopic.resources.map((resource, idx) => (
                        <a 
                          key={idx}
                          href={resource.url}
                          className="flex items-center p-3 rounded-lg border border-gray-100 hover:border-primary/50 hover:bg-indigo-50/50 transition-all group"
                        >
                          <div className="mr-3 text-primary opacity-70 group-hover:opacity-100">
                            {resource.type === 'video' ? <PlayCircle size={20} /> : <FileText size={20} />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 group-hover:text-primary truncate">{resource.title}</p>
                            <p className="text-xs text-gray-400 capitalize">{resource.type}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
             <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center">
               <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
               <h3 className="text-xl font-bold text-gray-900">All Caught Up!</h3>
               <p className="text-gray-500 mb-6">You've completed all available topics. Great work!</p>
               <Link to="/roadmap" className="text-primary font-semibold hover:underline">Review your journey</Link>
             </div>
          )}
        </div>

        {/* Right Column: Daily Goals */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 h-fit">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
            <span>Daily Goals</span>
            <span className="text-xs font-normal text-gray-400">{dailyGoals.filter(g => g.completed).length}/{dailyGoals.length}</span>
          </h2>
          
          <div className="space-y-3 mb-6">
            {dailyGoals.map(goal => (
              <div 
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  goal.completed ? 'bg-gray-50 text-gray-400 line-through' : 'bg-white border border-gray-200 hover:border-primary'
                }`}
              >
                {goal.completed ? (
                  <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                ) : (
                  <Circle className="text-gray-300 flex-shrink-0" size={20} />
                )}
                <span className="text-sm">{goal.text}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddGoal} className="relative">
            <input
              type="text"
              placeholder="Add a new goal..."
              className="w-full pl-4 pr-10 py-2 bg-gray-50 border-transparent focus:bg-white focus:border-primary border rounded-lg text-sm outline-none transition-all"
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary font-bold text-lg hover:text-indigo-700"
            >
              +
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
