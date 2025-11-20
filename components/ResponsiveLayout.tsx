// components/ResponsiveLayout.tsx
import React, { useState, ReactNode } from 'react';
import Sidebar from './Sidebar'; // your existing Sidebar
import { Menu, X } from 'lucide-react';

interface ResponsiveLayoutProps {
  children: ReactNode;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-20 w-64 bg-white shadow-xl transform transition-transform duration-300
          md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar />
      </div>

      {/* Overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/25 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Hamburger / Close button */}
      <button
        className="fixed top-4 left-4 z-30 md:hidden bg-white p-2 rounded-lg shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300
          md:ml-64
        `}
      >
        {children}
      </div>
    </div>
  );
};

export default ResponsiveLayout;
