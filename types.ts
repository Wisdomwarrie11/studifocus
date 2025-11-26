export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN'
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  streak: number;
  points: number;
  badges: Badge[];
  completedTopics: string[]; // IDs of completed topics
  assessmentScores: Record<string, number>; // AssessmentID -> Score
}

export interface Resource {
  title: string;
  url: string;
  type: 'video' | 'article' | 'exercise';
}

export interface Topic {
  id: string;
  day: number; // 1-7
  title: string;
  description: string;
  resources: Resource[];
  estimatedMinutes: number;
}

export interface CourseWeek {
  id: string;
  weekNumber: number;
  title: string;
  topics: Topic[];
  isUnlocked: boolean;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // Index
}

export interface Assessment {
  id: string;
  weekId: string;
  title: string;
  questions: Question[];
  passingScore: number;
  unlocked: boolean;
}

export interface DailyGoal {
  id: string;
  text: string;
  completed: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface DailyNote {
  id: string;
  userId: string;
  note: string;
  date: string;
}

export interface FlashCard {
  id: string;
  userId: string;
  content: string;
  reminderInterval: 'hourly' | 'daily';
}

// --- New Types for Library Feature ---

export interface LibraryItem {
  id: string;
  title: string;
  category: string; // e.g., "Biology 101", "Personal Development"
  type: 'link' | 'text' | 'pdf';
  content: string; // URL or actual text content
  userNotes: string;
  createdAt: string;
}

export interface ReadingLog {
  id: string;
  itemId: string;
  itemTitle: string;
  durationSeconds: number;
  date: string;
}
export interface Community {
  id: string;
  name: string;
  description: string;
  members: number;
  platform: 'Slack' | 'Discord' | 'WhatsApp';
  joined: boolean;
  link: string;
}