import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, CheckSquare, PenTool, Zap, Plus, Save, Bell, 
  BookOpen, Clock, LayoutGrid, Library, X, ExternalLink, Trash2, StopCircle, 
  ChevronRight, BarChart2, FileText, Upload, Users, MessageSquare, Headphones, Volume2, VolumeX, Music
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LibraryItem } from '../types';

// --- Soundscape Generator Hook ---
const useSoundscape = (customAudioUrl: string | null) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [type, setType] = useState<'white' | 'pink' | 'custom'>('white');
  const [volume, setVolume] = useState(0.5);
  
  // Refs for Web Audio API (Noise)
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  
  // Ref for Custom Audio File
  const customAudioRef = useRef<HTMLAudioElement | null>(null);

  // Handle Volume Changes without restarting audio
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
    if (customAudioRef.current) {
      customAudioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    // Cleanup function to stop current sounds before starting new ones or when unmounting
    const cleanup = () => {
      if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch(e) {}
        sourceRef.current = null;
      }
      if (customAudioRef.current) {
        customAudioRef.current.pause();
      }
    };

    cleanup();

    if (isPlaying) {
      if (type === 'custom') {
        // Handle Custom Audio
        if (customAudioUrl) {
          if (!customAudioRef.current || customAudioRef.current.src !== customAudioUrl) {
            customAudioRef.current = new Audio(customAudioUrl);
            customAudioRef.current.loop = true;
          }
          customAudioRef.current.volume = volume;
          customAudioRef.current.play().catch(e => console.error("Custom audio play error:", e));
        }
      } else {
        // Handle White/Pink Noise (Web Audio API)
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        if(ctx.state === 'suspended') ctx.resume();

        const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        if (type === 'white') {
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
        } else if (type === 'pink') {
          // Pink Noise approximation
          let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.075076;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            data[i] *= 0.11; 
            b6 = white * 0.115926;
          }
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        
        if (!gainNodeRef.current) {
            gainNodeRef.current = ctx.createGain();
            gainNodeRef.current.connect(ctx.destination);
        }
        
        gainNodeRef.current.gain.value = volume;
        source.connect(gainNodeRef.current);
        source.start();
        sourceRef.current = source;
      }
    }

    return cleanup;
  }, [isPlaying, type, customAudioUrl]);

  return { isPlaying, setIsPlaying, type, setType, volume, setVolume };
};

const FocusTimer: React.FC = () => {
  const { 
    user, 
    completeFocusCheck, 
    dailyGoals, 
    toggleGoal, 
    addGoal, 
    flashCards, 
    addFlashCard, 
    submitDailyNote,
    libraryItems,
    addLibraryItem,
    updateLibraryItemNote,
    addReadingLog,
    readingLogs,
    deleteLibraryItem,
    communities,
    joinCommunity,
    leaveCommunity
  } = useApp();

  // --- Global View State ---
  const [activeTab, setActiveTab] = useState<'focus' | 'library' | 'community'>('focus');

  // ==========================================
  // FOCUS TIMER STATE
  // ==========================================
  const savedTime = localStorage.getItem('focusTimeLeft');
  const savedMode = localStorage.getItem('focusIsWorkMode');
  const savedActive = localStorage.getItem('focusIsActive');

  const [timeLeft, setTimeLeft] = useState<number>(savedTime ? Number(savedTime) : 25 * 60);
  const [isActive, setIsActive] = useState<boolean>(savedActive === 'true' ? true : false);
  const [isWorkMode, setIsWorkMode] = useState<boolean>(savedMode === 'false' ? false : true);

  const [newGoalText, setNewGoalText] = useState('');
  const [dailyNote, setDailyNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [newCardQ, setNewCardQ] = useState('');
  const [newCardInterval, setNewCardInterval] = useState<'hourly' | 'daily'>('hourly');

  // ==========================================
  // LIBRARY & READING STATE
  // ==========================================
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeReaderItem, setActiveReaderItem] = useState<LibraryItem | null>(null);
  
  // Reading Timer
  const [readingSeconds, setReadingSeconds] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const readingIntervalRef = useRef<number | null>(null);

  // New Item Form
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemType, setNewItemType] = useState<'link' | 'file'>('link');
  const [newItemContent, setNewItemContent] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // ==========================================
  // SOUNDSCAPE STATE
  // ==========================================
  const [customSoundUrl, setCustomSoundUrl] = useState<string | null>(null);
  const [customSoundName, setCustomSoundName] = useState<string | null>(null);
  
  const { isPlaying: isSoundPlaying, setIsPlaying: setSoundPlaying, type: soundType, setType: setSoundType, volume: soundVolume, setVolume: setSoundVolume } = useSoundscape(customSoundUrl);
  const [showSoundControls, setShowSoundControls] = useState(false);

  const handleCustomSoundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setCustomSoundUrl(url);
      setCustomSoundName(file.name);
      setSoundType('custom');
      if (!isSoundPlaying) setSoundPlaying(true);
    }
  };

  // ------------------------------------------
  // Focus Timer Logic
  // ------------------------------------------
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoalText.trim()) {
      addGoal(newGoalText);
      setNewGoalText('');
    }
  };

  const handleSaveNote = () => {
    if (dailyNote.trim()) {
      submitDailyNote(dailyNote);
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 3000);
      setDailyNote('');
    }
  };

  const handleAddFlashcard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCardQ.trim()) {
      addFlashCard(newCardQ, newCardInterval);
      setNewCardQ('');
      alert('Flashcard added!');
    }
  };

  // ------------------------------------------
  // Library Logic
  // ------------------------------------------
  
  const categories = ['All', ...Array.from(new Set(libraryItems.map(item => item.category)))];
  
  const filteredItems = selectedCategory === 'All' 
    ? libraryItems 
    : libraryItems.filter(item => item.category === selectedCategory);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (approx 4MB limit for base64 in localstorage safety)
      if (file.size > 10 * 1024 * 1024) {
          alert("File is too large for the library (Max 4MB). Please try a smaller file or use a link.");
          e.target.value = '';
          return;
      }
      setUploadFile(file);
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItemTitle || !newItemCategory) return;

    if (newItemType === 'link') {
        addLibraryItem({
            title: newItemTitle,
            category: newItemCategory,
            type: 'link',
            content: newItemContent
        });
        resetForm();
    } else {
        if (!uploadFile) {
            alert("Please select a file to upload");
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            addLibraryItem({
                title: newItemTitle,
                category: newItemCategory,
                type: 'file',
                content: base64,
                fileType: uploadFile.type,
                fileName: uploadFile.name
            });
            resetForm();
        };
        reader.readAsDataURL(uploadFile);
    }
  };

  const resetForm = () => {
    setIsAddingMaterial(false);
    setNewItemTitle('');
    setNewItemCategory('');
    setNewItemContent('');
    setUploadFile(null);
  };

  const openReader = (item: LibraryItem) => {
    setActiveReaderItem(item);
    setReadingSeconds(0);
    setIsReading(false);
  };

  const closeReader = () => {
    if (readingSeconds > 10 && activeReaderItem) {
      if(window.confirm("Do you want to save this reading session?")) {
        addReadingLog(activeReaderItem.id, activeReaderItem.title, readingSeconds);
      }
    }
    setActiveReaderItem(null);
    setIsReading(false);
    setReadingSeconds(0);
  };

  useEffect(() => {
    if (isReading) {
      readingIntervalRef.current = window.setInterval(() => {
        setReadingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (readingIntervalRef.current) clearInterval(readingIntervalRef.current);
    }
    return () => {
      if (readingIntervalRef.current) clearInterval(readingIntervalRef.current);
    };
  }, [isReading]);

  const handleReaderNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (activeReaderItem) {
      updateLibraryItemNote(activeReaderItem.id, e.target.value);
      setActiveReaderItem({ ...activeReaderItem, userNotes: e.target.value });
    }
  };

  // ------------------------------------------
  // RENDER
  // ------------------------------------------
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen relative">
      
      {/* Soundscape Widget */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {showSoundControls && (
            <div className="bg-white p-4 rounded-xl shadow-2xl border border-gray-100 mb-4 w-72 animate-fade-in">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-gray-700 text-sm flex items-center">
                      <Music size={14} className="mr-2 text-indigo-500"/> Focus Sounds
                    </h4>
                    <button onClick={() => setShowSoundControls(false)} className="text-gray-400 hover:text-gray-600"><X size={14}/></button>
                </div>
                
                <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                    <button 
                        onClick={() => setSoundType('white')}
                        className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${soundType === 'white' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        White
                    </button>
                    <button 
                        onClick={() => setSoundType('pink')}
                        className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${soundType === 'pink' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Rain
                    </button>
                    <button 
                        onClick={() => setSoundType('custom')}
                        className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${soundType === 'custom' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Custom
                    </button>
                </div>

                {soundType === 'custom' && (
                  <div className="mb-4">
                    <label className="flex flex-col items-center justify-center w-full p-3 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-1 pb-1">
                        <Upload size={20} className="text-gray-400 mb-1" />
                        <p className="text-xs text-gray-500 text-center">
                          {customSoundName ? <span className="text-indigo-600 font-semibold">{customSoundName}</span> : "Upload audio (mp3, wav)"}
                        </p>
                      </div>
                      <input type="file" className="hidden" accept="audio/*" onChange={handleCustomSoundUpload} />
                    </label>
                  </div>
                )}

                <div className="flex items-center space-x-2 mb-4">
                    {soundVolume === 0 ? <VolumeX size={16} className="text-gray-400"/> : <Volume2 size={16} className="text-gray-400" />}
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={soundVolume}
                        onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                </div>

                <button 
                    onClick={() => setSoundPlaying(!isSoundPlaying)}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${
                      isSoundPlaying 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                    }`}
                >
                    {isSoundPlaying ? 'Pause Audio' : 'Play Soundscape'}
                </button>
            </div>
        )}
        <button 
            onClick={() => setShowSoundControls(!showSoundControls)}
            className={`p-4 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 ${isSoundPlaying ? 'bg-indigo-600 text-white animate-pulse ring-4 ring-indigo-100' : 'bg-white text-gray-600 hover:text-indigo-600'}`}
        >
            <Headphones size={24} />
        </button>
      </div>

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
          <div className="lg:col-span-2 space-y-8">
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

          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-700 mb-1">Daily Micro-Goals</h3>
              <p className="text-xs text-gray-400 mb-4">Check off to earn 10 pts each!</p>

              <div className="space-y-3 mb-6">
                {dailyGoals.map((goal) => (
                  <div key={goal.id} className="flex items-start space-x-3 group cursor-pointer" onClick={() => toggleGoal(goal.id)}>
                    <div className={`mt-1 transition-colors ${goal.completed ? 'text-green-500' : 'text-gray-300 group-hover:text-gray-400'}`}>
                      {goal.completed ? <CheckSquare size={20} /> : <div className="w-5 h-5 border-2 border-current rounded" />}
                    </div>
                    <p className={`text-sm transition-all ${goal.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{goal.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddGoal} className="flex items-center space-x-2 border-t border-gray-100 pt-4">
                <input type="text" placeholder="Add goal..." className="flex-1 text-sm border-none outline-none bg-transparent" value={newGoalText} onChange={(e) => setNewGoalText(e.target.value)} />
                <button type="submit" className="text-indigo-600 bg-indigo-50 p-2 rounded-lg hover:bg-indigo-100 transition-colors">
                  <Plus size={16} />
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
                <Bell className="mr-2 text-yellow-500" size={20} /> Flashcard Reminders
              </h3>

              <div className="space-y-4 mb-6 max-h-48 overflow-y-auto">
                {flashCards.map((card) => (
                  <div key={card.id} className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                    <p className="text-sm font-medium text-gray-800">{card.text}</p>
                    <p className="text-xs text-gray-500 mt-1 uppercase">{card.interval}</p>
                  </div>
                ))}
                {flashCards.length === 0 && <p className="text-sm text-gray-400 italic">No reminders set.</p>}
              </div>

              <form onSubmit={handleAddFlashcard} className="space-y-3 border-t border-gray-100 pt-4">
                <input type="text" placeholder="Reminder note..." className="w-full text-sm border border-gray-200 rounded p-2" value={newCardQ} onChange={(e) => setNewCardQ(e.target.value)} />
                <div className="flex gap-2">
                  <select className="text-sm border border-gray-200 rounded p-2 flex-1" value={newCardInterval} onChange={(e) => setNewCardInterval(e.target.value as 'hourly' | 'daily')}>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                  </select>
                  <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded text-sm font-bold">Set</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ======================= COMMUNITY TAB ======================= */}
      {activeTab === 'community' && (
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
      )}

      {/* ======================= LIBRARY TAB ======================= */}
      {activeTab === 'library' && !activeReaderItem && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <button 
                onClick={() => setIsAddingMaterial(!isAddingMaterial)}
                className="w-full flex items-center justify-center bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors mb-6 shadow-indigo-100 shadow-lg"
              >
                <Plus size={18} className="mr-2" /> Add Material
              </button>
              
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Courses & Categories</h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${selectedCategory === cat ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <span>{cat}</span>
                    <span className="bg-gray-100 text-gray-500 text-xs py-0.5 px-2 rounded-full">
                      {cat === 'All' ? libraryItems.length : libraryItems.filter(i => i.category === cat).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reading Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-bold text-gray-700 flex items-center mb-4">
                <BarChart2 size={16} className="mr-2 text-indigo-500" /> Recent Sessions
              </h3>
              <div className="space-y-4">
                {readingLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="text-sm">
                    <p className="text-gray-800 font-medium truncate">{log.itemTitle}</p>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{Math.floor(log.durationSeconds / 60)} mins</span>
                      <span>{new Date(log.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {readingLogs.length === 0 && <p className="text-xs text-gray-400 italic">No reading sessions recorded yet.</p>}
              </div>
            </div>
          </div>

          {/* Main Content: Library Grid */}
          <div className="lg:col-span-3">
            {isAddingMaterial && (
              <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-6 mb-8 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-gray-800">Add to Library</h3>
                   <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <form onSubmit={handleAddItem} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Title of Book / Document" 
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={newItemTitle}
                      onChange={e => setNewItemTitle(e.target.value)}
                      required
                    />
                    <input 
                      type="text" 
                      placeholder="Course / Category" 
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={newItemCategory}
                      onChange={e => setNewItemCategory(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex space-x-4">
                    <label className={`flex items-center space-x-2 cursor-pointer p-3 border rounded-xl flex-1 ${newItemType === 'link' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}>
                      <input type="radio" name="type" value="link" checked={newItemType === 'link'} onChange={() => setNewItemType('link')} className="hidden" />
                      <ExternalLink size={16} className={newItemType === 'link' ? 'text-indigo-600' : 'text-gray-400'} />
                      <span className={`font-medium ${newItemType === 'link' ? 'text-indigo-800' : 'text-gray-600'}`}>Link URL</span>
                    </label>
                    <label className={`flex items-center space-x-2 cursor-pointer p-3 border rounded-xl flex-1 ${newItemType === 'file' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}>
                      <input type="radio" name="type" value="file" checked={newItemType === 'file'} onChange={() => setNewItemType('file')} className="hidden" />
                      <FileText size={16} className={newItemType === 'file' ? 'text-indigo-600' : 'text-gray-400'} />
                      <span className={`font-medium ${newItemType === 'file' ? 'text-indigo-800' : 'text-gray-600'}`}>Upload File</span>
                    </label>
                  </div>
                  
                  {newItemType === 'link' ? (
                    <input 
                        type="url"
                        placeholder="https://example.com/article"
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={newItemContent}
                        onChange={e => setNewItemContent(e.target.value)}
                        required
                    />
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative">
                        <input 
                            type="file" 
                            accept=".pdf,.doc,.docx,.ppt,.pptx" 
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="pointer-events-none">
                            <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                            {uploadFile ? (
                                <p className="text-indigo-600 font-bold">{uploadFile.name}</p>
                            ) : (
                                <>
                                    <p className="text-gray-600 font-medium">Click to upload file</p>
                                    <p className="text-xs text-gray-400 mt-1">PDF, DOC, PPT accepted (Max 4MB)</p>
                                </>
                            )}
                        </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                      Save to Library
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <Library size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No materials found in this category.</p>
                  <button onClick={() => setIsAddingMaterial(true)} className="mt-2 text-indigo-600 font-semibold hover:underline">Add your first item</button>
                </div>
              ) : (
                filteredItems.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow group relative flex flex-col h-full">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button onClick={(e) => { e.stopPropagation(); deleteLibraryItem(item.id); }} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-start justify-between mb-4">
                      <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded uppercase tracking-wide truncate max-w-[150px]">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{item.title}</h3>
                    <div className="flex items-center text-xs text-gray-500 mb-6 mt-auto">
                      {item.type === 'link' ? <ExternalLink size={14} className="mr-1" /> : <FileText size={14} className="mr-1" />}
                      {item.type === 'link' ? 'Link' : (item.fileName?.split('.').pop()?.toUpperCase() || 'FILE')}
                      <span className="mx-2">•</span>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                    <button 
                      onClick={() => openReader(item)}
                      className="w-full flex items-center justify-center bg-gray-50 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors group-hover:bg-indigo-600 group-hover:text-white"
                    >
                      {item.type === 'file' && item.fileType !== 'application/pdf' ? 'Download / View' : 'Read Now'} 
                      <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================= READER MODE ======================= */}
      {activeTab === 'library' && activeReaderItem && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col animate-fade-in">
          {/* Reader Header */}
          <div className="bg-white border-b border-gray-200 p-4 px-8 flex justify-between items-center shadow-sm z-50">
            <div className="flex items-center overflow-hidden">
              <button onClick={closeReader} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 flex-shrink-0">
                <X size={24} />
              </button>
              <div className="truncate">
                <h2 className="text-xl font-bold text-gray-800 truncate">{activeReaderItem.title}</h2>
                <p className="text-sm text-gray-500">{activeReaderItem.category}</p>
              </div>
            </div>

            <div className="flex items-center space-x-6 bg-gray-50 px-6 py-2 rounded-xl border border-gray-200 flex-shrink-0">
              <div className={`text-2xl font-mono font-bold ${isReading ? 'text-indigo-600' : 'text-gray-400'}`}>
                {formatTime(readingSeconds)}
              </div>
              <div className="h-8 w-px bg-gray-300"></div>
              <button 
                onClick={() => setIsReading(!isReading)}
                className={`p-2 rounded-full text-white transition-colors ${isReading ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-500 hover:bg-green-600'}`}
              >
                {isReading ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </button>
              {readingSeconds > 0 && (
                 <button onClick={closeReader} className="text-red-500 font-semibold text-sm hover:underline hidden md:block">
                    Stop & Save
                 </button>
              )}
            </div>
          </div>

          {/* Reader Body */}
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
             {/* Content Area */}
             <div className="flex-1 bg-gray-50 p-0 lg:p-6 overflow-hidden flex flex-col">
               <div className="w-full h-full bg-white shadow-sm rounded-none lg:rounded-xl overflow-hidden relative">
                 {activeReaderItem.type === 'link' ? (
                   <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                     <ExternalLink size={64} className="text-indigo-200 mb-6" />
                     <h3 className="text-xl font-bold text-gray-800 mb-4">External Resource</h3>
                     <p className="text-gray-500 mb-8 max-w-md">This material is hosted externally. Keep this timer running to track your reading.</p>
                     <a 
                      href={activeReaderItem.content.startsWith('http') ? activeReaderItem.content : `https://${activeReaderItem.content}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-transform hover:-translate-y-1"
                     >
                       Open Link <ExternalLink size={18} className="ml-2" />
                     </a>
                   </div>
                 ) : activeReaderItem.fileType === 'application/pdf' ? (
                     <iframe 
                        src={activeReaderItem.content} 
                        className="w-full h-full border-none" 
                        title="PDF Viewer"
                     />
                 ) : (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <FileText size={64} className="text-indigo-200 mb-6" />
                        <h3 className="text-xl font-bold text-gray-800 mb-4">{activeReaderItem.fileName}</h3>
                        <p className="text-gray-500 mb-8 max-w-md">This file type cannot be previewed directly in the browser.</p>
                        <a 
                         href={activeReaderItem.content} 
                         download={activeReaderItem.fileName || "download"}
                         className="inline-flex items-center bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-transform hover:-translate-y-1"
                        >
                          Download File <Upload size={18} className="ml-2 transform rotate-180" />
                        </a>
                    </div>
                 )}
               </div>
             </div>

             {/* Notes Sidebar */}
             <div className="w-full lg:w-96 bg-white border-l border-gray-200 flex flex-col h-1/3 lg:h-full shadow-xl z-20">
               <div className="p-4 border-b border-gray-100 bg-gray-50">
                 <h3 className="font-bold text-gray-700 flex items-center">
                   <PenTool size={16} className="mr-2 text-indigo-500" /> Study Notes
                 </h3>
               </div>
               <textarea 
                 className="flex-1 p-4 resize-none outline-none focus:bg-indigo-50/30 transition-colors"
                 placeholder="Type your notes here while you read..."
                 value={activeReaderItem.userNotes}
                 onChange={handleReaderNoteChange}
               />
               <div className="p-3 bg-gray-50 text-xs text-gray-400 text-center border-t border-gray-100">
                 Notes are saved automatically
               </div>
             </div>
          </div>
          <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {showSoundControls && (
            <div className="bg-white p-4 rounded-xl shadow-2xl border border-gray-100 mb-4 w-72 animate-fade-in">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-gray-700 text-sm flex items-center">
                      <Music size={14} className="mr-2 text-indigo-500"/> Focus Sounds
                    </h4>
                    <button onClick={() => setShowSoundControls(false)} className="text-gray-400 hover:text-gray-600"><X size={14}/></button>
                </div>
                
                <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                    <button 
                        onClick={() => setSoundType('white')}
                        className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${soundType === 'white' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        White
                    </button>
                    <button 
                        onClick={() => setSoundType('pink')}
                        className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${soundType === 'pink' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Rain
                    </button>
                    <button 
                        onClick={() => setSoundType('custom')}
                        className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${soundType === 'custom' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Custom
                    </button>
                </div>

                {soundType === 'custom' && (
                  <div className="mb-4">
                    <label className="flex flex-col items-center justify-center w-full p-3 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-1 pb-1">
                        <Upload size={20} className="text-gray-400 mb-1" />
                        <p className="text-xs text-gray-500 text-center">
                          {customSoundName ? <span className="text-indigo-600 font-semibold">{customSoundName}</span> : "Upload audio (mp3, wav)"}
                        </p>
                      </div>
                      <input type="file" className="hidden" accept="audio/*" onChange={handleCustomSoundUpload} />
                    </label>
                  </div>
                )}

                <div className="flex items-center space-x-2 mb-4">
                    {soundVolume === 0 ? <VolumeX size={16} className="text-gray-400"/> : <Volume2 size={16} className="text-gray-400" />}
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={soundVolume}
                        onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                </div>

                <button 
                    onClick={() => setSoundPlaying(!isSoundPlaying)}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${
                      isSoundPlaying 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                    }`}
                >
                    {isSoundPlaying ? 'Pause Audio' : 'Play Soundscape'}
                </button>
            </div>
        )}
        <button 
            onClick={() => setShowSoundControls(!showSoundControls)}
            className={`p-4 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 ${isSoundPlaying ? 'bg-indigo-600 text-white animate-pulse ring-4 ring-indigo-100' : 'bg-white text-gray-600 hover:text-indigo-600'}`}
        >
            <Headphones size={24} />
        </button>
      </div>
        </div>
      )}
    </div>
  );
};

export default FocusTimer;