// context/AppContext.tsx
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

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  weeks: CourseWeek[];
  assessments: Assessment[];
  dailyGoals: DailyGoal[];
  addGoal: (text: string) => void;
  toggleGoal: (id: string) => void;
  completeTopic: (topicId: string) => void;
  submitAssessment: (assessmentId: string, score: number) => void;
  addTopic: (weekId: string, topic: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [weeks, setWeeks] = useState<CourseWeek[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([]);

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
          // Restore full user from localStorage
          setUser(JSON.parse(saved));
        } else {
          // Fallback to creating user from Firebase info
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

    // Role validation
    if (selectedRole === UserRole.ADMIN && !isAdmin) {
      throw new Error("Access denied. This account is not an admin.");
    }
    if (selectedRole === UserRole.STUDENT && isAdmin) {
      throw new Error("Admins cannot log in as students.");
    }

    // Preserve displayName
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

  // --- App Data Logic (Weeks, Goals, Topics, Assessments) ---
  const addGoal = (text: string) => setDailyGoals([...dailyGoals, { id: Date.now().toString(), text, completed: false }]);
  const toggleGoal = (id: string) => setDailyGoals(goals => goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  const completeTopic = (topicId: string) => { if (!user) return; if (!user.completedTopics.includes(topicId)) setUser({ ...user, completedTopics: [...user.completedTopics, topicId] }); };
  const submitAssessment = (assessmentId: string, score: number) => { if (!user) return; setUser({ ...user, assessmentScores: { ...user.assessmentScores, [assessmentId]: score } }); };
  const addTopic = (weekId: string, topicData: any) => setWeeks(prev => prev.map(w => w.id === weekId ? { ...w, topics: [...w.topics, { ...topicData, id: Date.now().toString() }] } : w));

  return (
    <AppContext.Provider value={{ user, setUser, login, register, logout, weeks, assessments, dailyGoals, addGoal, toggleGoal, completeTopic, submitAssessment, addTopic }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
