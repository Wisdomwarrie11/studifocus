import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, CourseWeek, Assessment, DailyGoal, LibraryItem, ReadingLog, Community } from '../types';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  getIdTokenResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
  } from 'firebase/auth';
  import { auth } from '../src/firebase';

interface FlashCard {
  id: string;
  text: string;
  interval: 'hourly' | 'daily';
}

interface Announcement {
  id: string;
  text: string;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  weeks: CourseWeek[];
  assessments: Assessment[];
  dailyGoals: DailyGoal[];
  flashCards: FlashCard[];
  announcements: Announcement[];
  libraryItems: LibraryItem[];
  readingLogs: ReadingLog[];
  communities: Community[];
  addGoal: (text: string) => void;
  toggleGoal: (id: string) => void;
  completeFocusCheck: () => void;
  submitDailyNote: (note: string) => void;
  addFlashCard: (text: string, interval: 'hourly' | 'daily') => void;
  addAnnouncement: (text: string) => void;
  
  // Library Methods
  addLibraryItem: (item: Omit<LibraryItem, 'id' | 'createdAt' | 'userNotes'>) => void;
  updateLibraryItemNote: (id: string, note: string) => void;
  addReadingLog: (itemId: string, itemTitle: string, durationSeconds: number) => void;
  deleteLibraryItem: (id: string) => void;
  
  // Community Methods
  joinCommunity: (id: string) => void;
  leaveCommunity: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>(() => {
    const saved = localStorage.getItem('dailyGoals');
    return saved ? JSON.parse(saved) : [];
  });

  const [flashCards, setFlashCards] = useState<FlashCard[]>(() => {
    const saved = localStorage.getItem('flashCards');
    return saved ? JSON.parse(saved) : [];
  });

  const [weeks, setWeeks] = useState<CourseWeek[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('announcements');
    return saved ? JSON.parse(saved) : [];
  });

  // --- Library State ---
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>(() => {
    const saved = localStorage.getItem('libraryItems');
    return saved ? JSON.parse(saved) : [];
  });

  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>(() => {
    const saved = localStorage.getItem('readingLogs');
    return saved ? JSON.parse(saved) : [];
  });

  // --- Community State ---
  const initialCommunities: Community[] = [
    { id: '1', name: 'Midnight Scholars', description: 'For those who burn the midnight oil. 24/7 accountability.', members: 420, platform: 'Discord', joined: false, link: '#' },
    { id: '2', name: 'Med School Grind', description: 'Case studies, flashcards, and group reading sessions.', members: 89, platform: 'Slack', joined: false, link: '#' },
    { id: '3', name: 'Pomodoro Power', description: 'Group timers and productivity hacks.', members: 1250, platform: 'WhatsApp', joined: false, link: '#' },
    { id: '4', name: 'CS Algorithms', description: 'Daily LeetCode and textbook reading group.', members: 300, platform: 'Discord', joined: false, link: '#' }
  ];

  const [communities, setCommunities] = useState<Community[]>(() => {
    const saved = localStorage.getItem('communities');
    return saved ? JSON.parse(saved) : initialCommunities;
  });

  // --- Persistence ---
  useEffect(() => {
    if (user) localStorage.setItem('currentUser', JSON.stringify(user));
  }, [user]);

  useEffect(() => localStorage.setItem('dailyGoals', JSON.stringify(dailyGoals)), [dailyGoals]);
  useEffect(() => localStorage.setItem('flashCards', JSON.stringify(flashCards)), [flashCards]);
  useEffect(() => localStorage.setItem('announcements', JSON.stringify(announcements)), [announcements]);
  useEffect(() => localStorage.setItem('libraryItems', JSON.stringify(libraryItems)), [libraryItems]);
  useEffect(() => localStorage.setItem('readingLogs', JSON.stringify(readingLogs)), [readingLogs]);
  useEffect(() => localStorage.setItem('communities', JSON.stringify(communities)), [communities]);

// --- Firebase auth listener ---
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser && !user) {
  const saved = localStorage.getItem('currentUser');
  if (saved) setUser(JSON.parse(saved));
  else {
  const newUser: User = {
  id: firebaseUser.uid,
  name: firebaseUser.displayName || 'No Name',
  email: firebaseUser.email || '',
  role: UserRole.STUDENT,
  streak: 0,
  points: 0,
  badges: [],
  completedTopics: [],
  assessmentScores: {}
  };
  setUser(newUser);
  localStorage.setItem('currentUser', JSON.stringify(newUser));
  }
  } else if (!firebaseUser) {
  setUser(null);
  localStorage.removeItem('currentUser');
  }
  });
  return () => unsubscribe();
  }, []);
  
  // --- Auth & context functions ---
  const login = async (email: string, password: string, selectedRole: UserRole = UserRole.STUDENT) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const token = await getIdTokenResult(cred.user);
  const isAdmin = token.claims.admin === true;
  setUser({
  id: cred.user.uid,
  name: cred.user.displayName || 'No Name',
  email: cred.user.email || '',
  role: isAdmin ? UserRole.ADMIN : UserRole.STUDENT,
  streak: 0,
  points: 0,
  badges: [],
  completedTopics: [],
  assessmentScores: {}
  });
  };
  const register = async (name: string, email: string, password: string) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  setUser({
  id: cred.user.uid,
  name,
  email,
  role: UserRole.STUDENT,
  streak: 0,
  points: 0,
  badges: [],
  completedTopics: [],
  assessmentScores: {}
  });
  };
  const logout = async () => {
  await signOut(auth);
  setUser(null);
  localStorage.removeItem('currentUser');
  };


  const addGoal = (text: string) => setDailyGoals([...dailyGoals, { id: Date.now().toString(), text, completed: false }]);

  const toggleGoal = (id: string) => {
    if (!user) return;
    setDailyGoals(goals =>
      goals.map(g => {
        if (g.id === id) {
          const completed = !g.completed;
          if (completed) setUser({ ...user, points: user.points + 10 });
          return { ...g, completed };
        }
        return g;
      })
    );
  };

  const completeFocusCheck = () => {
    if (!user) return;
    setUser({ ...user, points: user.points + 2 });
  };

  const submitDailyNote = (note: string) => {
    if (!user) return;
    setUser({ ...user, points: user.points + 10 });
  };

  const addFlashCard = (text: string, interval: 'hourly' | 'daily') => {
    setFlashCards([...flashCards, { id: Date.now().toString(), text, interval }]);
  };

  const addAnnouncement = (text: string) => {
    const newAnnouncement = { id: Date.now().toString(), text };
    setAnnouncements(prev => [newAnnouncement, ...prev]);
  };

  // --- Library Methods ---

  const addLibraryItem = (item: Omit<LibraryItem, 'id' | 'createdAt' | 'userNotes'>) => {
    const newItem: LibraryItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      userNotes: ''
    };
    
    // Check for storage quota roughly
    try {
        const testString = JSON.stringify([...libraryItems, newItem]);
        if (testString.length > 4500000) { // Safety buffer before 5MB
            alert("Storage limit reached! Please delete some items before adding new files.");
            return;
        }
        setLibraryItems(prev => [newItem, ...prev]);
    } catch (e) {
        alert("File too large for local storage browser limit (5MB). Please try a smaller file or use a Link.");
    }
  };

  const updateLibraryItemNote = (id: string, note: string) => {
    setLibraryItems(prev => prev.map(item => item.id === id ? { ...item, userNotes: note } : item));
  };

  const deleteLibraryItem = (id: string) => {
    setLibraryItems(prev => prev.filter(item => item.id !== id));
  };

  const addReadingLog = (itemId: string, itemTitle: string, durationSeconds: number) => {
    const newLog: ReadingLog = {
      id: Date.now().toString(),
      itemId,
      itemTitle,
      durationSeconds,
      date: new Date().toISOString()
    };
    setReadingLogs(prev => [newLog, ...prev]);
    if (user) {
        const pointsEarned = Math.floor(durationSeconds / 60); 
        setUser({ ...user, points: user.points + pointsEarned });
    }
  };

  // --- Community Methods ---
  const joinCommunity = (id: string) => {
    setCommunities(prev => prev.map(c => c.id === id ? { ...c, joined: true, members: c.members + 1 } : c));
  };

  const leaveCommunity = (id: string) => {
    setCommunities(prev => prev.map(c => c.id === id ? { ...c, joined: false, members: c.members - 1 } : c));
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      login,
      register,
      logout,
      weeks,
      assessments,
      dailyGoals,
      flashCards,
      announcements,
      libraryItems,
      readingLogs,
      communities,
      addGoal,
      toggleGoal,
      completeFocusCheck,
      submitDailyNote,
      addFlashCard,
      addAnnouncement,
      addLibraryItem,
      updateLibraryItemNote,
      addReadingLog,
      deleteLibraryItem,
      joinCommunity,
      leaveCommunity
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};