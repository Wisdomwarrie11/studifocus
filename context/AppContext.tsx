import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, CourseWeek, Assessment, DailyGoal } from '../types';
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
  addGoal: (text: string) => void;
  toggleGoal: (id: string) => void;
  completeFocusCheck: () => void;
  submitDailyNote: (note: string) => void;
  addFlashCard: (text: string, interval: 'hourly' | 'daily') => void;
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

  // --- Persist to localStorage whenever state changes ---
  useEffect(() => {
    if (user) localStorage.setItem('currentUser', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('dailyGoals', JSON.stringify(dailyGoals));
  }, [dailyGoals]);

  useEffect(() => {
    localStorage.setItem('flashCards', JSON.stringify(flashCards));
  }, [flashCards]);

  // --- Firebase auth listener ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && !user) {
        // If no user in state, load from localStorage or create new
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

  // --- Context functions ---
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

  return (
    <AppContext.Provider value={{

      
      user, setUser, login, register, logout, weeks,
      dailyGoals, flashCards,
      addGoal, toggleGoal, completeFocusCheck, submitDailyNote, addFlashCard
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
