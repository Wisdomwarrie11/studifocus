// context/AppContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, CourseWeek, Assessment, DailyGoal, Badge } from '../types';
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut, 
  getIdTokenResult,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  User as FirebaseUser 
} from 'firebase/auth';
import { auth } from '../src/firebase';

interface FlashCard {
  id: string;
  text: string;
  interval: 'hourly' | 'daily';
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
  announcements: string[];
  // New functions
  addGoal: (text: string) => void;
  toggleGoal: (id: string) => void;
  completeTopic: (topicId: string) => void;
  submitAssessment: (assessmentId: string, score: number) => void;
  completeFocusCheck: () => void;
  submitDailyNote: (note: string) => void;
  addFlashCard: (text: string, interval: 'hourly' | 'daily') => void;
  lockIn: () => void;
  addAnnouncement: (text: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [weeks, setWeeks] = useState<CourseWeek[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([]);
  const [flashCards, setFlashCards] = useState<FlashCard[]>([]);
  const [announcements, setAnnouncements] = useState<string[]>([]);

  const saveUser = (firebaseUser: FirebaseUser, role: UserRole = UserRole.STUDENT) => {
    const mappedUser: User = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || 'No Name',
      email: firebaseUser.email || '',
      role,
      streak: 0,
      points: 0,
      badges: [],
      completedTopics: [],
      assessmentScores: {}
    };
    setUser(mappedUser);
    localStorage.setItem('currentUser', JSON.stringify(mappedUser));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const saved = localStorage.getItem('currentUser');
        if (saved) {
          setUser(JSON.parse(saved));
        } else {
          saveUser(firebaseUser, UserRole.STUDENT);
        }
      } else {
        setUser(null);
        localStorage.removeItem('currentUser');
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string, selectedRole: UserRole = UserRole.STUDENT) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const token = await getIdTokenResult(cred.user);
    const isAdmin = token.claims.admin === true;

    if (selectedRole === UserRole.ADMIN && !isAdmin) throw new Error("Access denied.");
    if (selectedRole === UserRole.STUDENT && isAdmin) throw new Error("Admins cannot log in as students.");

    saveUser(cred.user, isAdmin ? UserRole.ADMIN : UserRole.STUDENT);
  };

  const register = async (name: string, email: string, password: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (credential.user) {
      await updateProfile(credential.user, { displayName: name });
      saveUser(credential.user, UserRole.STUDENT);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  // --- Study Room & Points Logic ---
  const addGoal = (text: string) => setDailyGoals([...dailyGoals, { id: Date.now().toString(), text, completed: false }]);
  
  const toggleGoal = (id: string) => {
    if (!user) return;
    setDailyGoals(goals => goals.map(g => {
      if (g.id === id) {
        const completed = !g.completed;
        if (completed) {
          // Award 10 points per completed goal
          setUser({ ...user, points: user.points + 10 });
          alert(`🎯 Goal completed! You earned 10 points.`);
        }
        return { ...g, completed };
      }
      return g;
    }));
  };

  const completeFocusCheck = () => {
    if (!user) return;
    setUser({ ...user, points: user.points + 2 });
    alert(`✅ Focus check completed! You earned 2 points.`);
  };

  const submitDailyNote = (note: string) => {
    if (!user) return;
    setUser({ ...user, points: user.points + 10 });
    alert(`📝 Daily note submitted! You earned 10 points.`);
  };

  const addFlashCard = (text: string, interval: 'hourly' | 'daily') => {
    setFlashCards([...flashCards, { id: Date.now().toString(), text, interval }]);
  };

  const completeTopic = (topicId: string) => {
    if (!user) return;
    if (!user.completedTopics.includes(topicId)) setUser({ ...user, completedTopics: [...user.completedTopics, topicId] });
  };

  const submitAssessment = (assessmentId: string, score: number) => {
    if (!user) return;
    setUser({ ...user, assessmentScores: { ...user.assessmentScores, [assessmentId]: score } });
  };

  const lockIn = () => {
    if (!user) return;
    // Only once per day
    const today = new Date().toDateString();
    const lastLock = localStorage.getItem(`lockIn-${user.id}`);
    if (lastLock === today) return;
    setUser({ ...user, points: user.points + 10 });
    localStorage.setItem(`lockIn-${user.id}`, today);
    alert(`🔒 Locked in! You earned 10 points.`);
  };

  const addAnnouncement = (text: string) => {
    setAnnouncements([...announcements, text]);
  };

  const addTopic = (weekId: string, topicData: any) => setWeeks(prev => prev.map(w => w.id === weekId ? { ...w, topics: [...w.topics, { ...topicData, id: Date.now().toString() }] } : w));

  return (
    <AppContext.Provider value={{
      user, setUser, login, register, logout, weeks, assessments, dailyGoals,
      flashCards, announcements, addGoal, toggleGoal, completeTopic, submitAssessment,
      completeFocusCheck, submitDailyNote, addFlashCard, lockIn, addAnnouncement, addTopic
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
