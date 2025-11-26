import React, { useState } from 'react';
import { LibraryItem } from '../types';
import SoundController from './SoundController';
import TimerWidget from './TimerWidget';
import GoalsWidget from './GoalsWidget';
import LibraryDashboard from './LibraryDashboard';
import ReaderModal from './ReaderModal';
import CommunityDashboard from './community';

const FocusTimer: React.FC = () => {
  // Global View State
  const [activeTab, setActiveTab] = useState<'focus' | 'library' | 'community'>('focus');
  const [activeReaderItem, setActiveReaderItem] = useState<LibraryItem | null>(null);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen relative">
      
      {/* Sound Controller Widget */}
      <SoundController />

      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Virtual Study Room</h1>
          <p className="text-gray-500">Your personal space for deep work, library, and community.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl mt-4 md:mt-0 overflow-x-auto max-w-full">
          {(['focus', 'library', 'community'] as const).map((tab) => (
             <button 
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all capitalize whitespace-nowrap ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
           >
             {tab === 'focus' ? 'Focus Timer' : tab === 'library' ? 'My Library' : 'Community'}
           </button>
          ))}
        </div>
      </div>

      {/* ======================= FOCUS TIMER TAB ======================= */}
      {activeTab === 'focus' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <TimerWidget />
          <div className="space-y-8">
            <GoalsWidget />
          </div>
        </div>
      )}

      {/* ======================= COMMUNITY TAB ======================= */}
      {activeTab === 'community' && <CommunityDashboard />}

      {/* ======================= LIBRARY TAB ======================= */}
      {activeTab === 'library' && !activeReaderItem && (
        <LibraryDashboard onOpenReader={setActiveReaderItem} />
      )}

      {/* ======================= READER MODE ======================= */}
      {activeTab === 'library' && activeReaderItem && (
        <ReaderModal item={activeReaderItem} onClose={() => setActiveReaderItem(null)} />
      )}
    </div>
  );
};

export default FocusTimer;
