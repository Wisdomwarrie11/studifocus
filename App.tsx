import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import StudentDashboard from './pages/StudentDashboard';
import Roadmap from './pages/Roadmap';
import Progress from './pages/Progress';
import FocusTimer from './pages/FocusTimer';
import Assessment from './pages/Assessment';
import AdminPanel from './pages/AdminPanel';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Sidebar />
          {/* 
            Layout Wrapper:
            md:ml-64 -> Adds left margin on desktop to make room for the sidebar.
            pt-16    -> Adds top padding on mobile for the fixed header.
            md:pt-0  -> Removes top padding on desktop.
          */}
          <main className="md:ml-64 pt-16 md:pt-0 min-h-screen transition-all duration-200">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/study" element={<FocusTimer />} />
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;