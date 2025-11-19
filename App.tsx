
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import FocusTimer from './pages/FocusTimer';
import Assessment from './pages/Assessment';
import Progress from './pages/Progress';
import AdminPanel from './pages/AdminPanel';
import Register from './pages/Registration';

// Wrapper to handle authenticated layout vs public layout
const Layout = () => {
  const { user } = useApp();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Outlet />
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />


      <Route element={<Layout />}>
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/study" element={<FocusTimer />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/admin" element={<AdminPanel />} />

      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
