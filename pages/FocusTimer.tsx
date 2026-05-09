import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, CheckSquare, PenTool, Zap, Plus, Save, Bell, 
  BookOpen, Clock, LayoutGrid, Library, X, ExternalLink, Trash2, StopCircle, 
  ChevronRight, BarChart2, Brain
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LibraryItem } from '../types';
import RoadmapWidget from './RoadmapWidget';
import AnalyticsDashboard from './AnalyticsDashboard';
import { supabase } from '../src/supabase';

const FocusTimer: React.FC = () => {
  const { 
    user, 
    loading,
    login,
    logout,
    dailyGoals, 
    toggleGoal, 
    addGoal, 
    flashCards, 
    addFlashCard, 
    addPoints,
    libraryItems,
    addLibraryItem,
    updateLibraryItemNote,
    addReadingLog,
    readingLogs,
    deleteLibraryItem,
    addActivity,
    completeFocusCheck,
    submitDailyNote
  } = useApp();

  // --- Global View State ---
  const [activeTab, setActiveTab] = useState<'focus' | 'library' | 'roadmap' | 'analytics'>('focus');

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

  // New Item Form
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemType, setNewItemType] = useState<LibraryItem['type']>('link');
  const [newItemContent, setNewItemContent] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle || !newItemCategory) return;

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
            const filePath = `${user?.id || 'anonymous'}/${fileName}`;

            const { data, error } = await supabase.storage
                .from('library')
                .upload(filePath, uploadFile);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('library')
                .getPublicUrl(filePath);
            
            finalContent = publicUrl;
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
      // Local update to keep UI responsive
      setActiveReaderItem({ ...activeReaderItem, userNotes: e.target.value });
    }
  };

  // ------------------------------------------
  // RENDER
  // ------------------------------------------
  if (loading) {
    return (
        <div className="min-h-screen bg-transparent flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );
  }

  if (!user) {
    return (
        <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-6 text-white text-center">
            <div className="bg-white/10 p-6 rounded-full mb-8 backdrop-blur-xl animate-bounce">
                <Brain size={80} className="text-white" />
            </div>
            <h1 className="text-4xl font-black mb-4 tracking-tight">Student Focus</h1>
            <p className="text-indigo-100 max-w-sm mb-12 text-lg">Your personalized gamified journey to academic mastery, now synced across devices.</p>
            
            <button 
                onClick={login}
                className="bg-white text-indigo-600 px-10 py-5 rounded-3xl font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center space-x-3 group"
            >
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <Zap size={20} className="text-indigo-600" />
                </div>
                <span>Connect with Google</span>
            </button>
            
            <div className="mt-12 flex items-center space-x-6 text-indigo-200">
                <div className="flex flex-col items-center">
                    <CheckSquare size={20} />
                    <span className="text-[10px] font-bold uppercase mt-1 tracking-widest">Roadmaps</span>
                </div>
                <div className="flex flex-col items-center">
                    <BarChart2 size={20} />
                    <span className="text-[10px] font-bold uppercase mt-1 tracking-widest">Analytics</span>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Virtual Study Room</h1>
          <div className="flex items-center space-x-4">
            <p className="text-gray-500">Welcome back, <span className="text-indigo-600 font-bold">{user.name}</span></p>
            <button onClick={logout} className="text-[10px] uppercase tracking-widest font-black text-gray-400 hover:text-red-500 transition-colors">Logout</button>
          </div>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl mt-4 md:mt-0">
          <button 
            onClick={() => setActiveTab('focus')}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'focus' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Focus Timer
          </button>
          <button 
            onClick={() => setActiveTab('library')}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'library' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            My Library
          </button>
          <button 
            onClick={() => setActiveTab('roadmap')}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'roadmap' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Roadmap
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'analytics' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* ======================= FOCUS TIMER TAB ======================= */}
      {activeTab === 'focus' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timer + Notes */}
          <div className="lg:col-span-2 space-y-8">
            {/* Timer Card */}
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

            {/* Daily Note */}
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

          {/* Goals + Flashcards */}
          <div className="space-y-8">
            {/* Daily Goals */}
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

            {/* Flashcards */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
                <Bell className="mr-2 text-yellow-500" size={20} /> Flashcard Reminders
              </h3>

              <div className="space-y-4 mb-6 max-h-48 overflow-y-auto">
                {flashCards.map((card) => (
                  <div key={card.id} className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                    <p className="text-sm font-medium text-gray-800">{card.content}</p>
                    <p className="text-xs text-gray-500 mt-1 uppercase">{card.reminderInterval}</p>
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

      {/* ======================= LIBRARY TAB ======================= */}
      {activeTab === 'library' && !activeReaderItem && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
          
          {/* Sidebar: Categories & Progress */}
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
                   <button onClick={() => setIsAddingMaterial(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <form onSubmit={handleAddItem} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Title of Book / Article" 
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={newItemTitle}
                      onChange={e => setNewItemTitle(e.target.value)}
                      required
                    />
                    <input 
                      type="text" 
                      placeholder="Course / Category (e.g. History)" 
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
                    <label className={`flex items-center space-x-2 cursor-pointer p-3 border rounded-xl flex-1 ${newItemType === 'text' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}>
                      <input type="radio" name="type" value="text" checked={newItemType === 'text'} onChange={() => setNewItemType('text')} className="hidden" />
                      <BookOpen size={16} className={newItemType === 'text' ? 'text-indigo-600' : 'text-gray-400'} />
                      <span className={`font-medium ${newItemType === 'text' ? 'text-indigo-800' : 'text-gray-600'}`}>Paste Text</span>
                    </label>
                    <label className={`flex items-center space-x-2 cursor-pointer p-3 border rounded-xl flex-1 ${newItemType === 'pdf' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}>
                      <input type="radio" name="type" value="pdf" checked={newItemType === 'pdf'} onChange={() => setNewItemType('pdf')} className="hidden" />
                      <BarChart2 size={16} className={newItemType === 'pdf' ? 'text-indigo-600' : 'text-gray-400'} />
                      <span className={`font-medium ${newItemType === 'pdf' ? 'text-indigo-800' : 'text-gray-600'}`}>File / PDF</span>
                    </label>
                  </div>
                  
                  {newItemType === 'pdf' ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative">
                        <input 
                            type="file" 
                            accept=".pdf,.doc,.docx" 
                            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center">
                            <Plus className="text-gray-300 mb-2" size={32} />
                            <p className="text-sm text-gray-500 font-medium">
                                {uploadFile ? uploadFile.name : "Click or drag to upload study material"}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">PDF or Word Documents</p>
                        </div>
                    </div>
                  ) : (
                    <textarea 
                        placeholder={newItemType === 'link' ? "https://..." : "Paste the article content here..."}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                        value={newItemContent}
                        onChange={e => setNewItemContent(e.target.value)}
                        required={newItemType !== 'pdf'}
                    />
                  )}
                  
                  <div className="flex justify-end">
                    <button 
                        type="submit" 
                        disabled={isUploading}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {isUploading ? 'Uploading...' : 'Save to Library'}
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
                  <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow group relative">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); deleteLibraryItem(item.id); }} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-start justify-between mb-4">
                      <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded uppercase tracking-wide">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3rem]">{item.title}</h3>
                    <div className="flex items-center text-xs text-gray-500 mb-6">
                      {item.type === 'link' ? <ExternalLink size={14} className="mr-1" /> : <BookOpen size={14} className="mr-1" />}
                      {item.type === 'link' ? 'External Link' : 'Text Document'}
                      <span className="mx-2">•</span>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                    <button 
                      onClick={() => openReader(item)}
                      className="w-full flex items-center justify-center bg-gray-50 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors group-hover:bg-indigo-600 group-hover:text-white"
                    >
                      Open Material <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================= ROADMAP TAB ======================= */}
      {activeTab === 'roadmap' && <RoadmapWidget />}

      {/* ======================= ANALYTICS TAB ======================= */}
      {activeTab === 'analytics' && <AnalyticsDashboard />}

      {/* ======================= READER MODE ======================= */}
      {activeTab === 'library' && activeReaderItem && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col animate-fade-in">
          {/* Reader Header */}
          <div className="bg-white border-b border-gray-200 p-4 px-8 flex justify-between items-center shadow-sm">
            <div className="flex items-center">
              <button onClick={closeReader} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <X size={24} />
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{activeReaderItem.title}</h2>
                <p className="text-sm text-gray-500">{activeReaderItem.category}</p>
              </div>
            </div>

            <div className="flex items-center space-x-6 bg-gray-50 px-6 py-2 rounded-xl border border-gray-200">
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
                 <button onClick={closeReader} className="text-red-500 font-semibold text-sm hover:underline">
                    Stop & Save
                 </button>
              )}
            </div>
          </div>

          {/* Reader Body */}
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
             {/* Content Area */}
             <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
               <div className="max-w-4xl mx-auto bg-white min-h-full shadow-sm rounded-xl p-8 lg:p-12">
                 {activeReaderItem.type === 'link' ? (
                   <div className="text-center py-12">
                     <ExternalLink size={64} className="mx-auto text-indigo-200 mb-6" />
                     <h3 className="text-xl font-bold text-gray-800 mb-4">External Resource</h3>
                     <p className="text-gray-500 mb-8 max-w-md mx-auto">This material is hosted externally. Click the button below to open it in a new tab. Keep this timer running to track your reading.</p>
                     <a 
                      href={activeReaderItem.content.startsWith('http') ? activeReaderItem.content : `https://${activeReaderItem.content}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-transform hover:-translate-y-1"
                     >
                       Open Link <ExternalLink size={18} className="ml-2" />
                     </a>
                     <div className="mt-12 p-4 bg-yellow-50 rounded-lg border border-yellow-100 text-left">
                       <p className="text-sm text-yellow-800 flex items-center"><Zap size={16} className="mr-2" /> Pro Tip: You can copy paste important text from the link into your notes on the right!</p>
                     </div>
                   </div>
                 ) : (
                   <div className="prose prose-indigo max-w-none">
                     <p className="whitespace-pre-wrap text-gray-800 leading-relaxed text-lg">{activeReaderItem.content}</p>
                   </div>
                 )}
               </div>
             </div>

             {/* Notes Sidebar */}
             <div className="w-full lg:w-96 bg-white border-l border-gray-200 flex flex-col h-1/2 lg:h-full shadow-xl z-10">
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
        </div>
      )}
    </div>
  );
};

export default FocusTimer;