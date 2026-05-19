import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  UserRole, 
  CourseWeek, 
  Assessment, 
  DailyGoal, 
  LibraryItem, 
  ReadingLog, 
  RoadmapTask, 
  Activity, 
  SubGoal,
  Community,
  FlashCard,
  Announcement,
  JournalEntry
} from '../types';
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut, 
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { auth, db } from '../src/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  login: (email?: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  weeks: CourseWeek[];
  assessments: Assessment[];
  dailyGoals: DailyGoal[];
  flashCards: FlashCard[];
  announcements: Announcement[];
  communities: Community[];
  libraryItems: LibraryItem[];
  readingLogs: ReadingLog[];
  roadmapTasks: RoadmapTask[];
  activities: Activity[];
  journals: JournalEntry[];
  addGoal: (text: string) => void;
  toggleGoal: (id: string) => void;
  addActivity: (type: Activity['type'], metadata?: any, duration?: number) => void;
  addPoints: (amount: number) => void;
  addFlashCard: (text: string, interval: 'hourly' | 'daily') => void;
  addAnnouncement: (text: string) => void;
  addTopic: (weekId: string, topic: any) => void;
  postAnnouncement: (announcement: any) => void;
  completeFocusCheck: () => void;
  submitDailyNote: (note: string) => void;
  joinCommunity: (id: string) => void;
  leaveCommunity: (id: string) => void;
  addAnnouncementts?: (text: string) => void;
  
  // Roadmap Methods
  addRoadmapTask: (title: string, description: string, goals: string[]) => void;
  updateRoadmapProgress: (taskId: string, goalId: string) => void;
  deleteRoadmapTask: (taskId: string) => void;
  updateRoadmapTask: (taskId: string, updates: Partial<RoadmapTask>) => void;

  // Library Methods
  addLibraryItem: (item: Omit<LibraryItem, 'id' | 'userId' | 'createdAt' | 'userNotes'>) => void;
  updateLibraryItemNote: (id: string, note: string) => void;
  addReadingLog: (itemId: string, itemTitle: string, durationSeconds: number) => void;
  deleteLibraryItem: (id: string) => void;
  saveStorageFeedback: (willingToPay: boolean) => Promise<void>;
  deferredPrompt: any;
  setDeferredPrompt: (prompt: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([]);
  const [flashCards, setFlashCards] = useState<FlashCard[]>([]);
  const [weeks, setWeeks] = useState<CourseWeek[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [communities, setCommunities] = useState<Community[]>([
    { id: '1', name: 'Frontend Masters', description: 'Deep dive into modern web tech.', members: 1240, platform: 'Discord', joined: false, link: '#' },
    { id: '2', name: 'UI/UX Architects', description: 'Design discussions and critiques.', members: 850, platform: 'Slack', joined: true, link: '#' },
    { id: '3', name: 'Code & Chill', description: 'Casual networking for students.', members: 2100, platform: 'WhatsApp', joined: false, link: '#' }
  ]);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>([]);
  const [roadmapTasks, setRoadmapTasks] = useState<RoadmapTask[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // --- Auth & Data Listener ---
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    let activeUnsubs: (() => void)[] = [];

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser ? "User logged in" : "No user");
      // Clean up any existing listeners first
      activeUnsubs.forEach(u => u());
      activeUnsubs = [];

      if (firebaseUser) {
        setLoading(true);
        try {
          // Fetch or create user profile
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          let userData: User;
          if (!userDoc.exists()) {
            userData = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Student',
              email: firebaseUser.email || '',
              role: UserRole.STUDENT,
              streak: 1,
              points: 0,
              badges: [],
              completedTopics: [],
              assessmentScores: {}
            };
            await setDoc(userDocRef, userData);
          } else {
            userData = userDoc.data() as User;
          }
          setUser(userData);

          // Set up real-time listeners for all user data
          const qGoals = query(collection(db, 'goals'), where('userId', '==', firebaseUser.uid));
          const unsubGoals = onSnapshot(qGoals, 
            (snap) => setDailyGoals(snap.docs.map(d => ({ id: d.id, ...d.data() } as DailyGoal))), 
            (err) => handleFirestoreError(err, OperationType.LIST, 'goals')
          );
          activeUnsubs.push(unsubGoals);

          const qLibrary = query(collection(db, 'libraryItems'), where('userId', '==', firebaseUser.uid));
          const unsubLibrary = onSnapshot(qLibrary, 
            (snap) => setLibraryItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as LibraryItem))), 
            (err) => handleFirestoreError(err, OperationType.LIST, 'libraryItems')
          );
          activeUnsubs.push(unsubLibrary);

          const qRoadmap = query(collection(db, 'roadmapTasks'), where('userId', '==', firebaseUser.uid));
          const unsubRoadmap = onSnapshot(qRoadmap, 
            (snap) => setRoadmapTasks(snap.docs.map(d => ({ id: d.id, ...d.data() } as RoadmapTask))), 
            (err) => handleFirestoreError(err, OperationType.LIST, 'roadmapTasks')
          );
          activeUnsubs.push(unsubRoadmap);

          const qLogs = query(collection(db, 'readingLogs'), where('userId', '==', firebaseUser.uid), orderBy('date', 'desc'), limit(10));
          const unsubLogs = onSnapshot(qLogs, 
            (snap) => setReadingLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as ReadingLog))), 
            (err) => handleFirestoreError(err, OperationType.LIST, 'readingLogs')
          );
          activeUnsubs.push(unsubLogs);

          const qActivities = query(collection(db, 'activities'), where('userId', '==', firebaseUser.uid), orderBy('timestamp', 'desc'), limit(20));
          const unsubActivities = onSnapshot(qActivities, 
            (snap) => setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() } as Activity))), 
            (err) => handleFirestoreError(err, OperationType.LIST, 'activities')
          );
          activeUnsubs.push(unsubActivities);

          const qJournals = query(collection(db, 'journals'), where('userId', '==', firebaseUser.uid), orderBy('timestamp', 'desc'));
          const unsubJournals = onSnapshot(qJournals, 
            (snap) => setJournals(snap.docs.map(d => ({ id: d.id, ...d.data() } as JournalEntry))), 
            (err) => handleFirestoreError(err, OperationType.LIST, 'journals')
          );
          activeUnsubs.push(unsubJournals);

        } catch (error) {
          console.error("Error initializing user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
        setDailyGoals([]);
        setLibraryItems([]);
        setRoadmapTasks([]);
        setReadingLogs([]);
        setActivities([]);
        setJournals([]);
      }
    });

    return () => {
      unsubscribeAuth();
      activeUnsubs.forEach(u => u());
    };
  }, []);

  const login = async (email?: string, password?: string) => {
    try {
      if (!email || !password) throw new Error("Email and password are required");
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login Error", error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userData: User = {
        id: firebaseUser.uid,
        name,
        email,
        role: UserRole.STUDENT,
        streak: 1,
        points: 0,
        badges: [],
        completedTopics: [],
        assessmentScores: {}
      };
      await setDoc(userDocRef, userData);
      setUser(userData);
    } catch (error) {
      console.error("Register Error", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const addGoal = async (text: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'goals'), {
        userId: user.id,
        text,
        completed: false,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'goals');
    }
  };

  const toggleGoal = async (id: string) => {
    if (!user) return;
    const goal = dailyGoals.find(g => g.id === id);
    if (!goal) return;
    
    try {
      const newStatus = !goal.completed;
      await updateDoc(doc(db, 'goals', id), { completed: newStatus });
      
      if (newStatus) {
        const newPoints = user.points + 10;
        await updateDoc(doc(db, 'users', user.id), { points: newPoints });
        setUser({ ...user, points: newPoints });
        addActivity('goal_completion', { goalId: id, text: goal.text });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `goals/${id}`);
    }
  };

  const addActivity = async (type: Activity['type'], metadata: any = {}, duration?: number) => {
    if (!user) return;
    try {
        await addDoc(collection(db, 'activities'), {
            userId: user.id,
            type,
            duration,
            metadata,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'activities');
    }
  };

  const addRoadmapTask = async (title: string, description: string, goalTexts: string[]) => {
    if (!user) return;
    const goals: SubGoal[] = goalTexts.map(text => ({
        id: Math.random().toString(36).substr(2, 9),
        text,
        completed: false
    }));

    try {
        await addDoc(collection(db, 'roadmapTasks'), {
            userId: user.id,
            title,
            description,
            targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            goals,
            avatarPosition: 0,
            createdAt: new Date().toISOString()
        });
    } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'roadmapTasks');
    }
  };

  const updateRoadmapProgress = async (taskId: string, goalId: string) => {
    if (!user) return;
    const task = roadmapTasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedGoals = task.goals.map(g => g.id === goalId ? { ...g, completed: !g.completed } : g);
    const completedCount = updatedGoals.filter(g => g.completed).length;
    const newPos = (completedCount / updatedGoals.length) * 100;

    try {
        await updateDoc(doc(db, 'roadmapTasks', taskId), { 
            goals: updatedGoals, 
            avatarPosition: newPos 
        });
        
        if (updatedGoals.find(g => g.id === goalId)?.completed) {
          const newPoints = user.points + 50;
          await updateDoc(doc(db, 'users', user.id), { points: newPoints });
          setUser({ ...user, points: newPoints });
          addActivity('roadmap_progress', { taskId, title: task.title, goalId, progress: newPos });
        }
    } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `roadmapTasks/${taskId}`);
    }
  };

  const deleteRoadmapTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'roadmapTasks', taskId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `roadmapTasks/${taskId}`);
    }
  };

  const updateRoadmapTask = async (taskId: string, updates: Partial<RoadmapTask>) => {
    try {
      await updateDoc(doc(db, 'roadmapTasks', taskId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `roadmapTasks/${taskId}`);
    }
  };

  const saveStorageFeedback = async (willingToPay: boolean) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'storageFeedback'), {
        userId: user.id,
        willingToPay,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'storageFeedback');
    }
  };

  const addPoints = async (amount: number) => {
    if (!user) return;
    try {
        const newPoints = user.points + amount;
        await updateDoc(doc(db, 'users', user.id), { points: newPoints });
        setUser({ ...user, points: newPoints });
    } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
    }
  };

  const completeFocusCheck = () => {
    addPoints(2);
  };

  const submitDailyNote = async (note: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'journals'), {
        userId: user.id,
        content: note,
        date: new Date().toISOString(),
        timestamp: serverTimestamp()
      });
      addPoints(10);
      addActivity('journal_entry', { preview: note.substring(0, 50) });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'journals');
    }
  };

  const addTopic = (weekId: string, topic: any) => {
    setWeeks(prev => prev.map(w => w.id === weekId ? { ...w, topics: [...w.topics, topic] } : w));
  };

  const postAnnouncement = (announcement: any) => {
    setAnnouncements(prev => [announcement, ...prev]);
  };

  const joinCommunity = (id: string) => {
    setCommunities(prev => prev.map(c => c.id === id ? { ...c, joined: true } : c));
  };

  const leaveCommunity = (id: string) => {
    setCommunities(prev => prev.map(c => c.id === id ? { ...c, joined: false } : c));
  };

  const addFlashCard = (text: string, interval: 'hourly' | 'daily') => {
    setFlashCards(prev => [...prev, { id: Date.now().toString(), userId: user?.id || '', content: text, reminderInterval: interval }]);
  };

  const addAnnouncement = (text: string) => {
    setAnnouncements(prev => [{ id: Date.now().toString(), title: 'Announcement', content: text, createdAt: new Date().toISOString() }, ...prev]);
  };

  const addLibraryItem = async (item: Omit<LibraryItem, 'id' | 'userId' | 'createdAt' | 'userNotes'>) => {
    if (!user) return;
    try {
        await addDoc(collection(db, 'libraryItems'), {
            ...item,
            userId: user.id,
            createdAt: new Date().toISOString(),
            userNotes: ''
        });
    } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'libraryItems');
    }
  };

  const updateLibraryItemNote = async (id: string, note: string) => {
    try {
      await updateDoc(doc(db, 'libraryItems', id), { userNotes: note });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `libraryItems/${id}`);
    }
  };

  const deleteLibraryItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'libraryItems', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `libraryItems/${id}`);
    }
  };

  const addReadingLog = async (itemId: string, itemTitle: string, durationSeconds: number) => {
    if (!user) return;
    try {
        await addDoc(collection(db, 'readingLogs'), {
            userId: user.id,
            itemId,
            itemTitle,
            durationSeconds,
            date: new Date().toISOString()
        });
        
        const newPoints = user.points + Math.floor(durationSeconds / 60);
        await updateDoc(doc(db, 'users', user.id), { points: newPoints });
        setUser({ ...user, points: newPoints });
        addActivity('reading', { itemId, itemTitle, durationSeconds });
    } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'readingLogs');
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      loading,
      login,
      register,
      logout,
      weeks,
      assessments,
      dailyGoals,
      flashCards,
      announcements,
      communities,
      libraryItems,
      readingLogs,
      roadmapTasks,
      activities,
      journals,
      addGoal,
      toggleGoal,
      addActivity,
      addPoints,
      addFlashCard,
      addAnnouncement,
      addTopic,
      postAnnouncement,
      completeFocusCheck,
      submitDailyNote,
      joinCommunity,
      leaveCommunity,
      addAnnouncementts: addAnnouncement,
      addRoadmapTask,
      updateRoadmapProgress,
      deleteRoadmapTask,
      updateRoadmapTask,
      addLibraryItem,
      updateLibraryItemNote,
      saveStorageFeedback,
      addReadingLog,
      deleteLibraryItem,
      deferredPrompt,
      setDeferredPrompt
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
