import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { analyzeProgress } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BrainCircuit } from 'lucide-react';

const Progress: React.FC = () => {
  const { user, assessments } = useApp();
  const [aiAnalysis, setAiAnalysis] = useState("Analyzing data...");

  // Mock Data for charts
  const weeklyData = [
    { name: 'Mon', hours: 1.5, focus: 70 },
    { name: 'Tue', hours: 2.0, focus: 85 },
    { name: 'Wed', hours: 0.5, focus: 40 },
    { name: 'Thu', hours: 3.0, focus: 90 },
    { name: 'Fri', hours: 2.5, focus: 80 },
    { name: 'Sat', hours: 4.0, focus: 95 },
    { name: 'Sun', hours: 1.0, focus: 60 },
  ];

  useEffect(() => {
    // Simulate checking assessment history for AI
    const history = Object.entries(user?.assessmentScores || {}).map(([id, score]) => ({
      date: new Date().toISOString(), // Mock date
      score: score as number
    }));
    
    if (history.length > 0) {
      analyzeProgress(history).then(setAiAnalysis);
    } else {
      setAiAnalysis("Complete your first assessment to get AI-driven insights.");
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Performance Analytics</h1>

      {/* AI Insight Banner */}
      <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-lg mb-8 flex items-start space-x-4">
        <div className="bg-gray-800 p-3 rounded-lg">
          <BrainCircuit size={24} className="text-purple-400" />
        </div>
        <div>
          <h3 className="font-bold text-purple-300 mb-1">AI Performance Insight</h3>
          <p className="text-gray-300 leading-relaxed">{aiAnalysis}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Study Hours Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h3 className="text-lg font-bold text-gray-700 mb-6">Study Hours (This Week)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                <Bar dataKey="hours" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Focus Score Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h3 className="text-lg font-bold text-gray-700 mb-6">Focus Quality Score</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius: '8px'}} />
                <Line type="monotone" dataKey="focus" stroke="#10B981" strokeWidth={3} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Badges Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h3 className="text-lg font-bold text-gray-700 mb-6">Badges & Achievements</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {user.badges.map(badge => (
              <div key={badge.id} className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl flex flex-col items-center text-center">
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h4 className="font-bold text-gray-800 text-sm">{badge.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
              </div>
            ))}
            {/* Placeholder Locked Badges */}
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex flex-col items-center text-center opacity-50 grayscale">
              <div className="text-4xl mb-2">👑</div>
              <h4 className="font-bold text-gray-800 text-sm">Week 4 King</h4>
              <p className="text-xs text-gray-500 mt-1">Complete Month 1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;