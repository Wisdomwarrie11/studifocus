import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Upload } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { weeks, addTopic } = useApp();
  const [selectedWeek, setSelectedWeek] = useState(weeks[0]?.id);
  
  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [duration, setDuration] = useState(30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedWeek) {
      addTopic(selectedWeek, {
        title,
        description: desc,
        estimatedMinutes: duration,
        day: 1, // Simplified for MVP
        resources: []
      });
      alert('Topic added successfully!');
      setTitle('');
      setDesc('');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto md:ml-64 mt-16 md:mt-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Curriculum Management</h1>
        <button className="w-full sm:w-auto bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center">
          <Upload size={16} className="mr-2" />
          Import CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-8">
        <h2 className="text-lg md:text-xl font-bold text-gray-700 mb-6 flex items-center">
          <Plus className="mr-2 text-indigo-600" />
          Add New Study Topic
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Week</label>
              <select 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
              >
                {weeks.map(w => (
                  <option key={w.id} value={w.id}>Week {w.weekNumber}: {w.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration (min)</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic Title</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
              placeholder="e.g., Advanced Calculus Limits"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description / Instructions</label>
            <textarea 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none h-32 resize-none"
              placeholder="Briefly describe what the student needs to learn..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button type="submit" className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
              Publish Topic
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h3 className="font-bold text-gray-700 mb-4">Existing Topics (Week 1)</h3>
        <div className="space-y-2">
           {weeks[0].topics.map(t => (
             <div key={t.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
               <span className="font-medium text-gray-800 text-sm md:text-base truncate mr-2">{t.title}</span>
               <span className="text-xs text-gray-500 whitespace-nowrap">{t.estimatedMinutes} min</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;