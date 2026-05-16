import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, CheckSquare, PenTool, Zap, Plus, Save, Bell, 
  BookOpen, Clock, LayoutGrid, Library, X, ExternalLink, Trash2, StopCircle, 
  ChevronRight, BarChart2, Brain, Sparkles, MessageSquare, Upload, LogOut, Menu
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LibraryItem } from '../types';
import RoadmapWidget from '../pages/RoadmapWidget';
import AnalyticsDashboard from '../pages/AnalyticsDashboard';
import { supabase } from '../src/supabase';
import { getMotivationalCoach, analyzeProgress } from '../services/geminiService';

const FocusTimer: React.FC = () => {
  const { 
    user, 
    logout, 
    dailyGoals, 
    toggleGoal, 
    addGoal, 
    flashCards, 
    addFlashCard, 
    libraryItems,
    addLibraryItem,
    updateLibraryItemNote,
    addReadingLog,
    readingLogs,
    deleteLibraryItem,
    addActivity,
    completeFocusCheck,
    submitDailyNote,
    saveStorageFeedback,
    journals
  } = useApp();

  // --- Global View State ---
  const [activeTab, setActiveTab] = useState<'focus' | 'library' | 'roadmap' | 'analytics' | 'journal'>('focus');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ==========================================
  // EXISTING FOCUS TIMER STATE
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
  // NEW LIBRARY & READING STATE
  // ==========================================
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeReaderItem, setActiveReaderItem] = useState<LibraryItem | null>(null);
  
  // Reading Session Timer
  const [readingSeconds, setReadingSeconds] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const readingIntervalRef = useRef<number | null>(null);

  // AI Coach state
  const [coachMessage, setCoachMessage] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Storage Feedback state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    if (user && activeTab === 'focus' && !coachMessage) {
      getMotivationalCoach(user.name, user.streak, user.points, "Starting a study session")
        .then(setCoachMessage);
    }
  }, [user, activeTab]);

  const handleRefreshCoach = async () => {
    if (!user) return;
    setIsAnalyzing(true);
    const msg = await getMotivationalCoach(user.name, user.streak, user.points, "Middle of the day checkup");
    setCoachMessage(msg);
    setIsAnalyzing(false);
  };

  // New Item Form
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemType, setNewItemType] = useState<LibraryItem['type']>('pdf');
  const [newItemContent, setNewItemContent] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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
        if (addActivity) addActivity('focus', { duration: 25 * 60 }, 25 * 60);
        
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

  const handleSaveNote = async () => {
    if (dailyNote.trim()) {
      await submitDailyNote(dailyNote);
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

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle || !newItemCategory) return;

    if (libraryItems.length >= 3) {
      setShowFeedbackModal(true);
      return;
    }

    let finalContent = newItemContent;

    if (newItemType === 'pdf') {
        if (!uploadFile) {
            alert("Please select a file to upload");
            return;
        }
        setIsUploading(true);
        try {
            const fileExt = uploadFile.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${user?.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('library')
                .upload(filePath, uploadFile);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('library')
                .getPublicUrl(filePath);
            
            finalContent = data.publicUrl;
        } catch (error: any) {
            console.error("Upload error:", error);
            alert(`Upload failed: ${error.message || 'Unknown error'}`);
            setIsUploading(false);
            return;
        }
        setIsUploading(false);
    }

    addLibraryItem({
        title: newItemTitle,
        category: newItemCategory,
        type: newItemType,
        content: finalContent
    });
    
    setIsAddingMaterial(false);
    setNewItemTitle('');
    setNewItemCategory('');
    setNewItemContent('');
    setUploadFile(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0] && newItemType === 'pdf') {
      setUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFeedback = async (interested: boolean) => {
    await saveStorageFeedback(interested);
    setShowFeedbackModal(false);
    alert(interested ? "Thanks for your interest! We'll notify you when premium storage is available." : "Thank you for your feedback!");
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

  // Reading Timer Effect
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

  // Handle Note taking in reader
  const handleReaderNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (activeReaderItem) {
      updateLibraryItemNote(activeReaderItem.id, e.target.value);
      setActiveReaderItem({ ...activeReaderItem, userNotes: e.target.value });
    }
  };

  if (!user) return null;

  const categories = ['All', ...Array.from(new Set(libraryItems.map(i => i.category)))];
  const filteredItems = selectedCategory === 'All' 
    ? libraryItems 
    : libraryItems.filter(i => i.category === selectedCategory);

  const sidebarItems = [
    { id: 'focus', label: 'Focus Room', icon: Clock },
    { id: 'library', label: 'My Library', icon: Library },
    { id: 'roadmap', label: 'Roadmap', icon: LayoutGrid },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'journal', label: 'Study Journal', icon: PenTool },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-deep-blue text-white h-screen fixed left-0 top-0 z-40">
        <div className="p-8">
            <div className="flex items-center space-x-3 mb-10">
                <div className="w-10 h-10 bg-brand-orange rounded-2xl flex items-center justify-center shadow-lg shadow-orange-900/40">
                   <Brain size={24} className="text-white" />
                </div>
                <h1 className="text-xl font-black tracking-tight text-white uppercase italic">StudyFocus</h1>
            </div>

            <nav className="space-y-2">
                {sidebarItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`w-full flex items-center space-x-3 px-4 py-4 rounded-2xl text-sm font-black transition-all group ${
                            activeTab === item.id 
                            ? 'bg-brand-orange text-white shadow-xl shadow-orange-900/20' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-gray-500 group-hover:text-white'} />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>

        <div className="mt-auto p-8 pt-0">
            <div className="bg-white/5 rounded-3xl p-4 border border-white/5 mb-6">
                <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center text-xs font-black">
                        {user.name[0]}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-black truncate">{user.name}</p>
                        <p className="text-[10px] text-gray-500 font-bold">{user.points} XP</p>
                    </div>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-orange" style={{ width: `${(user.points % 100)}%` }}></div>
                </div>
            </div>
            
            <button 
                onClick={logout} 
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-black text-gray-500 hover:text-red-400 hover:bg-red-400/5 transition-all"
            >
                <LogOut size={16} />
                <span>Logout</span>
            </button>
        </div>
      </aside>

      {/* Mobile Nav Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-deep-blue text-white flex items-center justify-between px-6 z-50">
        <div className="flex items-center space-x-2">
            <Brain size={20} className="text-brand-orange" />
            <span className="font-black tracking-tight uppercase italic text-sm">StudyFocus</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-white/10 rounded-xl">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-deep-blue/60 backdrop-blur-sm z-[55] lg:hidden"
                />
                <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    className="fixed top-0 left-0 bottom-0 w-72 bg-deep-blue text-white z-[60] lg:hidden p-8 flex flex-col"
                >
                    <div className="flex items-center space-x-3 mb-10">
                        <Brain size={28} className="text-brand-orange" />
                        <h1 className="text-xl font-black tracking-tight uppercase italic">StudyFocus</h1>
                    </div>

                    <nav className="space-y-2 flex-1">
                        {sidebarItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }}
                                className={`w-full flex items-center space-x-3 px-4 py-4 rounded-2xl text-sm font-black transition-all ${
                                    activeTab === item.id 
                                    ? 'bg-brand-orange text-white shadow-xl' 
                                    : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <button 
                        onClick={logout} 
                        className="flex items-center space-x-3 px-4 py-4 rounded-2xl text-sm font-black text-gray-500 hover:text-red-400 mt-auto"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </motion.div>
            </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 pt-20 lg:pt-0 min-h-screen overflow-y-auto">
        <div className="p-6 md:p-10 lg:p-12 max-w-6xl mx-auto">
            
            {/* Header Content for Current Tab */}
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl lg:text-4xl font-black text-deep-blue tracking-tight mb-2">
                        {sidebarItems.find(i => i.id === activeTab)?.label}
                    </h2>
                    <p className="text-gray-400 font-bold text-sm">
                        {activeTab === 'focus' && `Don't stop now, ${user.name}! One session at a time.`}
                        {activeTab === 'library' && `Your curated knowledge repository.`}
                        {activeTab === 'roadmap' && `Mapping your path to mastery.`}
                        {activeTab === 'analytics' && `Your learning metrics at a glance.`}
                        {activeTab === 'journal' && `Your daily study reflections.`}
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-3">
                        <Zap size={20} className="text-brand-orange fill-brand-orange/20" />
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Streaks</p>
                            <p className="text-sm font-black text-deep-blue">{user.streak} Days</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tab Views */}
            <div className="animate-fade-in">
                {activeTab === 'focus' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 flex flex-col items-center justify-center relative shadow-deep-blue/5 border border-gray-50">
                                <div className={`absolute top-0 left-0 w-full h-3 ${isWorkMode ? 'bg-brand-orange' : 'bg-green-500'}`}></div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 ${isWorkMode ? 'text-brand-orange' : 'text-green-500'}`}>
                                    {isWorkMode ? 'DEEP FOCUS ACTIVATED' : 'TAKE A WELL-DESERVED BREAK'}
                                </span>
                                <div className="text-7xl md:text-9xl font-mono font-black text-deep-blue mb-10 tracking-tighter">
                                    {formatTime(timeLeft)}
                                </div>

                                <div className="flex space-x-8">
                                    <button onClick={toggleTimer} className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all shadow-2xl active:scale-90 ${isActive ? 'bg-gray-100 text-deep-blue' : 'bg-deep-blue text-white shadow-deep-blue/20'}`}>
                                        {isActive ? <Pause size={32} /> : <Play size={32} fill="currentColor" />}
                                    </button>
                                    <button onClick={resetTimer} className="w-20 h-20 rounded-[2rem] bg-white text-gray-400 flex items-center justify-center hover:bg-gray-50 border border-gray-100 transition-all active:scale-95">
                                        <RotateCcw size={28} />
                                    </button>
                                </div>
                                <p className="mt-10 text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center">
                                    <Zap size={14} className="mr-2 text-brand-orange" /> Earn 2 XP per completed session
                                </p>
                            </div>

                            <div className="bg-deep-blue rounded-[2.5rem] shadow-2xl p-8 text-white overflow-hidden relative group border-4 border-white">
                                <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                                    <Brain size={250} />
                                </div>
                                <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-center">
                                    <div className="w-16 h-16 bg-brand-orange rounded-3xl flex items-center justify-center shrink-0 shadow-lg shadow-black/20">
                                        <Brain size={32} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-black tracking-tight text-xl mb-2 text-white/90">AI Study Mentor</h3>
                                        <p className="text-sm font-medium mb-4 italic text-white/70 leading-relaxed max-w-lg">
                                            "{coachMessage || 'Mastery is not a destination, but a pursuit. Keep going.'}"
                                        </p>
                                        <button 
                                            onClick={handleRefreshCoach}
                                            disabled={isAnalyzing}
                                            className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange hover:text-white transition-colors flex items-center"
                                        >
                                            <MessageSquare size={14} className="mr-2" /> {isAnalyzing ? 'RECALIBRATING...' : 'REQUEST NEW PERSPECTIVE'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-50">
                                <h3 className="text-sm font-black text-deep-blue mb-1 uppercase tracking-widest">Micro-Goals</h3>
                                <p className="text-[10px] font-bold text-gray-400 mb-6 uppercase tracking-widest">Efficiency earns 10 XP</p>

                                <div className="space-y-4 mb-8">
                                    {dailyGoals.map((goal) => (
                                        <div key={goal.id} className="flex items-start space-x-4 bg-gray-50/50 p-3 rounded-2xl cursor-pointer group" onClick={() => toggleGoal(goal.id)}>
                                            <div className={`mt-0.5 transition-all ${goal.completed ? 'text-green-500 scale-110' : 'text-gray-200 group-hover:text-gray-300'}`}>
                                                {goal.completed ? <CheckSquare size={22} fill="currentColor" className="text-white bg-green-500 rounded-lg" /> : <div className="w-5 h-5 border-2 border-current rounded-lg" />}
                                            </div>
                                            <p className={`text-sm font-bold transition-all flex-1 ${goal.completed ? 'text-gray-300 line-through' : 'text-deep-blue'}`}>{goal.text}</p>
                                        </div>
                                    ))}
                                    {dailyGoals.length === 0 && <p className="text-xs text-gray-400 italic text-center py-4">No goals for today yet.</p>}
                                </div>

                                <form onSubmit={handleAddGoal} className="flex items-center space-x-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                                    <input type="text" placeholder="I will achieve..." className="flex-1 text-xs font-bold border-none outline-none bg-transparent px-2" value={newGoalText} onChange={(e) => setNewGoalText(e.target.value)} />
                                    <button type="submit" className="text-white bg-brand-orange p-2 rounded-xl hover:bg-brand-orange/90 transition-all shadow-md">
                                        <Plus size={18} />
                                    </button>
                                </form>
                            </div>

                            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-50">
                                <h3 className="text-sm font-black text-deep-blue mb-6 uppercase tracking-widest flex items-center">
                                    <Bell size={18} className="mr-3 text-brand-orange" /> Reminders
                                </h3>
                                <div className="space-y-4 mb-8 max-h-48 overflow-y-auto pr-2">
                                    {flashCards.map((card) => (
                                        <div key={card.id} className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100/50 relative overflow-hidden group">
                                            <div className="absolute right-0 top-0 h-full w-1 bg-brand-orange/20"></div>
                                            <p className="text-xs font-bold text-deep-blue/80 italic">"{card.content}"</p>
                                            <p className="text-[10px] text-brand-orange font-black mt-2 uppercase tracking-widest">{card.reminderInterval}</p>
                                        </div>
                                    ))}
                                </div>
                                <form onSubmit={handleAddFlashcard} className="space-y-3">
                                    <input type="text" placeholder="Key concept to remember..." className="w-full text-xs font-bold border border-gray-100 rounded-2xl p-4 bg-gray-50 outline-none focus:bg-white focus:border-brand-orange transition-all" value={newCardQ} onChange={(e) => setNewCardQ(e.target.value)} />
                                    <div className="flex gap-3">
                                        <select className="text-xs font-black border border-gray-100 rounded-2xl p-4 flex-1 bg-gray-50 outline-none" value={newCardInterval} onChange={(e) => setNewCardInterval(e.target.value as 'hourly' | 'daily')}>
                                            <option value="hourly">HOURLY</option>
                                            <option value="daily">DAILY</option>
                                        </select>
                                        <button type="submit" className="bg-deep-blue text-white w-14 rounded-2xl font-black text-xs hover:bg-black transition-all">SET</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Note taking in focus room moved to its own card for focus */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-[2.5rem] shadow-xl p-8 lg:p-12 border border-gray-50">
                                <h3 className="text-xl font-black text-deep-blue mb-6 flex items-center tracking-tight">
                                    <PenTool className="mr-4 text-brand-orange" size={28} /> Daily Review
                                </h3>
                                <textarea
                                    className="w-full p-8 border-2 border-gray-100 rounded-[2rem] bg-gray-50 focus:bg-white focus:border-brand-orange outline-none resize-none h-48 transition-all font-medium text-deep-blue text-lg"
                                    placeholder="Distill what you've mastered today into words..."
                                    value={dailyNote}
                                    onChange={(e) => setDailyNote(e.target.value)}
                                />
                                <div className="flex justify-end mt-6">
                                    <button onClick={handleSaveNote} className="group flex items-center bg-brand-orange text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-orange-900/10 active:scale-95">
                                        <Save size={18} className="mr-3 group-hover:rotate-12 transition-transform" /> {noteSaved ? 'COMMITTED!' : 'COMMIT TO JOURNAL'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'library' && !activeReaderItem && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-8">
                            <button 
                                onClick={() => setIsAddingMaterial(!isAddingMaterial)}
                                className="w-full flex items-center justify-center bg-brand-orange text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-orange-900/20 transition-all shadow-xl shadow-orange-900/10 active:scale-95"
                            >
                                <Plus size={20} className="mr-2" /> DISCOVER NEW
                            </button>
                            
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">TAXONOMY</h3>
                                <div className="space-y-2">
                                    {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`w-full text-left px-5 py-4 rounded-2xl text-xs font-black transition-all flex justify-between items-center ${selectedCategory === cat ? 'bg-deep-blue text-white shadow-xl' : 'text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        <span>{cat}</span>
                                        <span className={`text-[10px] py-1 px-3 rounded-full ${selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        {cat === 'All' ? libraryItems.length : libraryItems.filter(i => i.category === cat).length}
                                        </span>
                                    </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center">
                                    <BarChart2 size={16} className="mr-2" /> HISTORY
                                </h3>
                                <div className="space-y-6">
                                    {readingLogs.slice(0, 5).map(log => (
                                    <div key={log.id} className="relative pl-4 border-l-2 border-brand-orange/20">
                                        <p className="text-xs text-deep-blue font-black truncate mb-1">{log.itemTitle}</p>
                                        <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                            <span>{Math.floor(log.durationSeconds / 60)}M</span>
                                            <span>{new Date(log.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    ))}
                                    {readingLogs.length === 0 && <p className="text-xs text-gray-400 italic font-medium">No sessions logged.</p>}
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="lg:col-span-3">
                            <AnimatePresence>
                                {isAddingMaterial && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-10 mb-12 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-6">
                                            <button onClick={() => setIsAddingMaterial(false)} className="text-gray-300 hover:text-deep-blue p-2 bg-gray-50 rounded-xl transition-colors"><X size={24} /></button>
                                        </div>
                                        <h3 className="text-2xl font-black text-deep-blue mb-8 tracking-tight flex items-center">
                                            <Plus size={28} className="mr-3 text-brand-orange" /> Expand Knowledge
                                        </h3>

                                        <form onSubmit={handleAddItem} className="space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Title</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Philosophical Foundations..." 
                                                        className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-orange outline-none transition-all font-bold text-deep-blue"
                                                        value={newItemTitle}
                                                        onChange={e => setNewItemTitle(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Context</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Philosophy 101" 
                                                        className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-orange outline-none transition-all font-bold text-deep-blue"
                                                        value={newItemCategory}
                                                        onChange={e => setNewItemCategory(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="flex bg-gray-50 p-2 rounded-[1.5rem] border border-gray-100">
                                                <button 
                                                    type="button"
                                                    onClick={() => setNewItemType('pdf')}
                                                    className={`flex-1 flex items-center justify-center py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${newItemType === 'pdf' ? 'bg-white text-brand-orange shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
                                                >
                                                    <Upload size={16} className="mr-2" /> PDF File
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => setNewItemType('text')}
                                                    className={`flex-1 flex items-center justify-center py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${newItemType === 'text' ? 'bg-white text-brand-orange shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
                                                >
                                                    <PenTool size={16} className="mr-2" /> Text Content
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => setNewItemType('link')}
                                                    className={`flex-1 flex items-center justify-center py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${newItemType === 'link' ? 'bg-white text-brand-orange shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
                                                >
                                                    <ExternalLink size={16} className="mr-2" /> External URL
                                                </button>
                                            </div>
                                            
                                            {newItemType === 'pdf' ? (
                                                <div 
                                                    className={`border-4 border-dashed rounded-[2.5rem] p-12 text-center transition-all relative group ${dragActive ? 'border-brand-orange bg-orange-50/50' : 'border-gray-100 hover:border-gray-200 bg-gray-50/30'}`}
                                                    onDragEnter={handleDrag}
                                                    onDragLeave={handleDrag}
                                                    onDragOver={handleDrag}
                                                    onDrop={handleDrop}
                                                >
                                                    <input 
                                                        type="file" 
                                                        accept=".pdf,.doc,.docx" 
                                                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    />
                                                    <div className="flex flex-col items-center">
                                                        <div className={`w-20 h-20 rounded-[2rem] mb-6 flex items-center justify-center transition-all ${uploadFile ? 'bg-brand-orange text-white shadow-xl' : 'bg-white text-gray-300 shadow-sm'}`}>
                                                            <Upload size={32} />
                                                        </div>
                                                        <p className="text-lg font-black text-deep-blue mb-1">
                                                            {uploadFile ? uploadFile.name : "Deposit your material"}
                                                        </p>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Supports PDF and Word up to 50MB</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
                                                        {newItemType === 'link' ? 'WEBSITE ADDRESS' : 'PASTED KNOWLEDGE'}
                                                    </label>
                                                    <textarea 
                                                        placeholder={newItemType === 'link' ? "https://..." : "Transfer knowledge here..."}
                                                        className="w-full p-6 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-brand-orange outline-none min-h-[200px] transition-all font-bold text-deep-blue"
                                                        value={newItemContent}
                                                        onChange={e => setNewItemContent(e.target.value)}
                                                        required={newItemType !== 'pdf'}
                                                    />
                                                </div>
                                            )}
                                            
                                            <div className="flex justify-end">
                                                <button 
                                                    type="submit" 
                                                    disabled={isUploading}
                                                    className="bg-brand-orange text-white px-12 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] hover:shadow-2xl transition-all disabled:opacity-50 shadow-orange-900/10"
                                                >
                                                    {isUploading ? 'SYNCHRONIZING...' : 'INCORPORATE TO LIBRARY'}
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {filteredItems.length === 0 ? (
                                    <div className="col-span-full py-24 text-center text-gray-300 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                                        <Library size={64} className="mx-auto mb-6 opacity-20" />
                                        <p className="text-xl font-black text-deep-blue mb-2">No lore found.</p>
                                        <p className="text-xs font-bold mb-8 italic text-gray-400">Add materials to begin your research.</p>
                                        <button onClick={() => setIsAddingMaterial(true)} className="text-brand-orange font-black text-xs uppercase tracking-widest hover:underline">Begin Discovery</button>
                                    </div>
                                ) : (
                                    filteredItems.map(item => (
                                        <div key={item.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-50 p-6 hover:shadow-2xl hover:shadow-deep-blue/5 hover:-translate-y-1 transition-all group relative">
                                            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                                <button onClick={(e) => { e.stopPropagation(); deleteLibraryItem(item.id); }} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                            <div className="mb-6">
                                                <span className="inline-block px-3 py-1 bg-orange-50 text-brand-orange text-[10px] font-black rounded-lg uppercase tracking-widest">
                                                    {item.category}
                                                </span>
                                            </div>
                                            <h3 className="font-black text-deep-blue mb-4 line-clamp-2 min-h-[3.5rem] text-lg leading-tight tracking-tight">{item.title}</h3>
                                            <div className="flex items-center text-[10px] font-black text-gray-400 mb-8 uppercase tracking-widest">
                                                <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center mr-2">
                                                    {item.type === 'link' ? <ExternalLink size={12} /> : item.type === 'pdf' ? <Upload size={12} /> : <BookOpen size={12} />}
                                                </div>
                                                {item.type.toUpperCase()} DOCUMENT
                                            </div>
                                            <button 
                                                onClick={() => openReader(item)}
                                                className="w-full flex items-center justify-center bg-gray-50 text-deep-blue py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-orange hover:text-white hover:shadow-xl hover:shadow-orange-900/20 transition-all"
                                            >
                                                ACCESS PORTAL <ChevronRight size={16} className="ml-2" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'roadmap' && <RoadmapWidget />}

                {activeTab === 'analytics' && <AnalyticsDashboard />}

                {activeTab === 'journal' && (
                    <div className="space-y-10">
                        <div className="bg-white rounded-[2.5rem] p-12 border border-gray-50 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 opacity-5">
                                <PenTool size={120} className="text-brand-orange" />
                            </div>
                            <h2 className="text-3xl font-black text-deep-blue mb-4 flex items-center tracking-tight">
                                <div className="w-12 h-12 bg-brand-orange rounded-2xl flex items-center justify-center mr-5 shadow-lg shadow-orange-900/20">
                                    <PenTool size={28} className="text-white" />
                                </div>
                                Personal Chronicles
                            </h2>
                            <p className="text-gray-400 font-bold max-w-xl text-lg">Every great mind kept a journal. Document your daily breakthroughs, struggles, and realizations.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {journals.map((entry) => (
                            <div key={entry.id} className="bg-white rounded-[2rem] p-8 border border-gray-50 shadow-sm hover:shadow-2xl hover:shadow-deep-blue/5 transition-all flex flex-col group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange mb-1">
                                            {new Date(entry.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                                        </span>
                                        <span className="text-2xl font-black text-deep-blue">{new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long' })}</span>
                                    </div>
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300">
                                        <BookOpen size={20} />
                                    </div>
                                </div>
                                <p className="text-deep-blue/80 text-base leading-relaxed whitespace-pre-wrap line-clamp-[8] font-medium flex-1 italic">
                                    "{entry.content}"
                                </p>
                                <div className="mt-8 pt-6 border-t border-gray-50 flex justify-between items-center">
                                    <span className="text-[10px] text-gray-300 font-black tracking-widest uppercase flex items-center">
                                        <Clock size={12} className="mr-1" /> {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <button className="text-[10px] font-black text-brand-orange uppercase tracking-widest hover:underline opacity-0 group-hover:opacity-100 transition-opacity">FULL ENTRY</button>
                                </div>
                            </div>
                            ))}
                            {journals.length === 0 && (
                            <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                                <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-gray-100">
                                   <PenTool size={48} className="text-gray-200" />
                                </div>
                                <p className="text-2xl font-black text-deep-blue mb-2">The pages are blank.</p>
                                <p className="text-sm font-bold text-gray-400 max-w-xs mx-auto">Visit the Focus Room to capture your first reflection and earn 10 XP.</p>
                                <button onClick={() => setActiveTab('focus')} className="mt-10 bg-deep-blue text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">Go to Focus Room</button>
                            </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Reader Mode (Portal) */}
            <AnimatePresence>
                {activeTab === 'library' && activeReaderItem && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-white z-[100] flex flex-col"
                    >
                        {/* Reader Header */}
                        <div className="bg-deep-blue border-b border-white/10 p-6 px-10 flex justify-between items-center shadow-xl">
                            <div className="flex items-center">
                                <button onClick={closeReader} className="mr-8 p-3 bg-white/10 hover:bg-brand-orange text-white rounded-2xl transition-all scale-110 active:scale-95 shadow-lg">
                                    <X size={24} />
                                </button>
                                <div>
                                    <p className="text-[10px] font-black text-brand-orange uppercase tracking-[0.3em] mb-1">{activeReaderItem.category}</p>
                                    <h2 className="text-xl font-black text-white tracking-tight leading-none">{activeReaderItem.title}</h2>
                                </div>
                            </div>

                            <div className="flex items-center space-x-8 bg-white/5 px-8 py-4 rounded-3xl border border-white/10 shadow-inner">
                                <div className={`text-3xl font-mono font-black ${isReading ? 'text-brand-orange drop-shadow-[0_0_10px_rgba(255,122,0,0.4)]' : 'text-gray-600'}`}>
                                    {formatTime(readingSeconds)}
                                </div>
                                <div className="h-10 w-px bg-white/10"></div>
                                <button 
                                    onClick={() => setIsReading(!isReading)}
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-90 ${isReading ? 'bg-brand-orange text-white' : 'bg-green-500 text-white'}`}
                                >
                                    {isReading ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                                </button>
                                {readingSeconds > 0 && (
                                    <button onClick={closeReader} className="text-white font-black text-[10px] uppercase tracking-widest hover:text-brand-orange transition-colors">
                                        SUBMIT PROGRESS
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Reader Body */}
                        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                            <div className="flex-1 bg-gray-50 p-10 lg:p-12 overflow-y-auto">
                                <div className="max-w-4xl mx-auto bg-white min-h-full shadow-2xl rounded-[3rem] p-12 lg:p-20 border border-gray-100 relative">
                                    {activeReaderItem.type === 'link' || activeReaderItem.type === 'pdf' ? (
                                        <div className="text-center py-20 flex flex-col items-center">
                                            <div className="w-32 h-32 bg-orange-50 rounded-[2.5rem] flex items-center justify-center mb-10 border border-orange-100">
                                               {activeReaderItem.type === 'link' ? <ExternalLink size={60} className="text-brand-orange" /> : <Upload size={60} className="text-brand-orange" />}
                                            </div>
                                            <h3 className="text-4xl font-black text-deep-blue mb-6 tracking-tighter">Accessing Repository</h3>
                                            <p className="text-gray-400 mb-12 max-w-sm font-bold text-lg leading-relaxed">This {activeReaderItem.type === 'link' ? 'knowledge cluster' : 'material'} is available in full at the provided resource portal. Open it to proceed with your study.</p>
                                            <a 
                                            href={(activeReaderItem.content.startsWith('http') || activeReaderItem.content.startsWith('blob')) ? activeReaderItem.content : `https://${activeReaderItem.content}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center bg-deep-blue text-white px-12 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-black transition-all hover:shadow-2xl hover:shadow-deep-blue/20 active:scale-95"
                                            >
                                                {activeReaderItem.type === 'link' ? 'OPEN PORTAL' : 'VIEW DOCUMENT'} <ExternalLink size={20} className="ml-3" />
                                            </a>
                                            <div className="mt-20 p-6 bg-orange-50 rounded-[2rem] border border-orange-100 text-left max-w-md">
                                                <p className="text-xs text-brand-orange flex items-start font-black uppercase tracking-widest leading-loose">
                                                    <Zap size={16} className="mr-3 mt-1 shrink-0" /> 
                                                    TIP: Use the research sidebar on the right to crystallize your thoughts while studying.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="prose prose-orange max-w-none">
                                            <p className="whitespace-pre-wrap text-deep-blue/90 leading-relaxed text-xl font-medium italic mb-10 border-l-8 border-brand-orange pl-10">
                                                {activeReaderItem.content}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Research Side Bar */}
                            <div className="w-full lg:w-[28rem] bg-white border-l border-gray-100 flex flex-col h-1/2 lg:h-full shadow-2xl z-10">
                                <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                                    <h3 className="font-black text-deep-blue flex items-center uppercase tracking-widest text-xs">
                                        <PenTool size={18} className="mr-3 text-brand-orange" /> Crystallized Thoughts
                                    </h3>
                                    <span className="text-[10px] font-black text-gray-300 uppercase">Saving...</span>
                                </div>
                                <textarea 
                                    className="flex-1 p-10 resize-none outline-none focus:bg-orange-50/10 transition-colors font-medium text-deep-blue text-lg italic leading-relaxed"
                                    placeholder="Translate your readings into insights..."
                                    value={activeReaderItem.userNotes}
                                    onChange={handleReaderNoteChange}
                                />
                                <div className="p-8 bg-gray-50 text-[10px] text-gray-400 text-center border-t border-gray-100 font-black uppercase tracking-[0.3em]">
                                    Subconscious synchronization active
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Storage Feedback Modal */}
            <AnimatePresence>
                {showFeedbackModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowFeedbackModal(false)}
                            className="absolute inset-0 bg-deep-blue/80 backdrop-blur-sm" 
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[3rem] p-12 max-w-md w-full relative z-10 shadow-2xl overflow-hidden text-center"
                        >
                            <div className="absolute top-0 right-0 p-8">
                                <button onClick={() => setShowFeedbackModal(false)} className="text-gray-300 hover:text-gray-500">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="bg-orange-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mb-10 mx-auto border border-orange-100 shadow-xl shadow-orange-100/50">
                                <Library size={48} className="text-brand-orange" />
                            </div>

                            <h2 className="text-3xl font-black text-deep-blue mb-4 tracking-tight">Capacity Reached</h2>
                            <p className="text-gray-500 text-sm font-bold leading-relaxed mb-10 px-4">
                                You've reached the storage cap of 3 scrolls. Incinerate old knowledge to make room for the new, or tell us if you need more room.
                            </p>

                            <div className="space-y-6">
                                <p className="text-[10px] font-black text-center uppercase tracking-[0.3em] text-gray-300">Expand Repository?</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => handleFeedback(true)}
                                        className="bg-brand-orange text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-900/10 hover:opacity-90 active:scale-95 transition-all"
                                    >
                                        YES, I'D PAY
                                    </button>
                                    <button 
                                        onClick={() => handleFeedback(false)}
                                        className="bg-gray-100 text-gray-400 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 active:scale-95 transition-all"
                                    >
                                        NO
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default FocusTimer;
