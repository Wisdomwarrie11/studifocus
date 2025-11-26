import React from 'react';
import { Users, Plus, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';

const CommunityDashboard: React.FC = () => {
  const { communities, joinCommunity, leaveCommunity } = useApp();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">Find Your Tribe</h2>
                    <p className="text-indigo-100 mb-6 max-w-lg">Studying is better together. Join a community to share notes, compete in challenges, and stay accountable.</p>
                    <a 
                        href="https://slack.com/create" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold inline-flex items-center hover:bg-indigo-50 transition-colors"
                    >
                        <Plus size={18} className="mr-2" /> Create New Slack Group
                    </a>
                </div>
                <Users className="absolute right-0 bottom-0 text-white opacity-10 transform translate-x-10 translate-y-10" size={240} />
            </div>

            <h3 className="text-xl font-bold text-gray-800 mt-8 mb-4">Suggested Communities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {communities.map(community => (
                    <div key={community.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${community.platform === 'Slack' ? 'bg-purple-100 text-purple-600' : community.platform === 'Discord' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
                                <MessageSquare size={24} />
                            </div>
                            <span className="bg-gray-100 text-gray-500 text-xs py-1 px-2 rounded-lg font-medium">{community.platform}</span>
                        </div>
                        <h4 className="font-bold text-gray-800 text-lg mb-1">{community.name}</h4>
                        <p className="text-sm text-gray-500 mb-4 h-10 line-clamp-2">{community.description}</p>
                        <div className="flex items-center justify-between mt-auto">
                            <span className="text-xs font-semibold text-gray-400 flex items-center">
                                <Users size={14} className="mr-1" /> {community.members} Members
                            </span>
                            <button 
                                onClick={() => community.joined ? leaveCommunity(community.id) : joinCommunity(community.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${community.joined ? 'bg-gray-100 text-gray-500' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                            >
                                {community.joined ? 'Joined' : 'Join Group'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="md:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
                  <h3 className="font-bold text-gray-800 mb-4">Your Groups</h3>
                  {communities.filter(c => c.joined).length > 0 ? (
                      <div className="space-y-4">
                          {communities.filter(c => c.joined).map(c => (
                              <div key={c.id} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-200">
                                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                      {c.name.substring(0,2).toUpperCase()}
                                  </div>
                                  <div>
                                      <p className="text-sm font-bold text-gray-800">{c.name}</p>
                                      <p className="text-xs text-gray-500">{c.platform} • Active now</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="text-center py-8 text-gray-400">
                          <Users size={32} className="mx-auto mb-2 opacity-30" />
                          <p className="text-sm">You haven't joined any groups yet.</p>
                      </div>
                  )}
              </div>
        </div>
    </div>
  );
};

export default CommunityDashboard;
