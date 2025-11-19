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
