import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import StudentDashboard from './pages/StudentDashboard';
import Roadmap from './pages/Roadmap';
import Progress from './pages/Progress';
import FocusTimer from './pages/FocusTimer';
import Assessment from './pages/Assessment';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';

// Protected Layout Component
const ProtectedLayout: React.FC = () => {
  const { user, loading } = useApp();
  
  // If auth is still loading, show a simple spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If not loading and no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="bg-navy-900">
      <Sidebar />
      {/* 
        Layout Wrapper:
        lg:ml-64 -> Adds left margin ONLY on large screens (desktop, >1024px).
        pt-16    -> Adds top padding on mobile/tablet for the fixed header.
        lg:pt-0  -> Removes top padding on desktop.
      */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen transition-all duration-200">
        <Outlet />
      </main>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const { user } = useApp();

  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/study" element={<FocusTimer />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Route>

      {/* Root Redirect Logic */}
      <Route 
        path="/" 
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
      />
      
      {/* Catch all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
};

export default App;