import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Megaphone, Users } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { weeks, addTopic, postAnnouncement, user } = useApp();
  const [activeTab, setActiveTab] = useState<'curriculum' | 'announcements' | 'grades'>('curriculum');
  
  // Topic Form
  const [selectedWeek, setSelectedWeek] = useState(weeks[0]?.id);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [duration, setDuration] = useState(30);

  // Announcement Form
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');

  const handleTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedWeek) {
      addTopic(selectedWeek, {
        title,
        description: desc,
        estimatedMinutes: duration,
        day: 1, 
        resources: []
      });
      alert('Topic added successfully!');
      setTitle('');
      setDesc('');
    }
  };

  const handleAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (annTitle && annMessage) {
      postAnnouncement(annTitle, annMessage);
      alert('Announcement Posted!');
      setAnnTitle('');
      setAnnMessage('');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveTab('curriculum')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'curriculum' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Curriculum
          </button>
          <button 
            onClick={() => setActiveTab('announcements')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'announcements' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Announcements
          </button>
          <button 
             onClick={() => setActiveTab('grades')}
             className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'grades' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Student Points
          </button>
        </div>
      </div>

      {/* Curriculum Management */}
      {activeTab === 'curriculum' && (
        <>
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center">
              <Plus className="mr-2 text-indigo-600" />
              Add New Study Topic
            </h2>

            <form onSubmit={handleTopicSubmit} className="space-y-6">
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
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                  Publish Topic
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center">
            <Megaphone className="mr-2 text-indigo-600" />
            Post Announcement
          </h2>
          <p className="text-gray-500 mb-6">This will be visible on the Student Dashboard immediately.</p>

          <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none h-32 resize-none"
                value={annMessage}
                onChange={(e) => setAnnMessage(e.target.value)}
                required
              ></textarea>
            </div>
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
              Post Update
            </button>
          </form>
        </div>
      )}

      {/* Grades/Points Tab */}
      {activeTab === 'grades' && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center">
            <Users className="mr-2 text-indigo-600" />
            Student Performance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
                  <th className="py-3 px-2">Student Name</th>
                  <th className="py-3 px-2">Total Points</th>
                  <th className="py-3 px-2">Streak</th>
                  <th className="py-3 px-2">Topics Done</th>
                  <th className="py-3 px-2">Assessments</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {/* For Real App: You would fetch all users here. Using current user just for view */}
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium">{user?.name} (You)</td>
                  <td className="py-3 px-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">{user?.points}</span>
                  </td>
                  <td className="py-3 px-2">{user?.streak} Days</td>
                  <td className="py-3 px-2">{user?.completedTopics.length}</td>
                  <td className="py-3 px-2">{Object.keys(user?.assessmentScores || {}).length} Completed</td>
                  <td className="py-3 px-2 text-right">
                    <button className="text-indigo-600 hover:text-indigo-800 font-medium">View Details</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;