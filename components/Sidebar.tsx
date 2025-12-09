import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Target, 
  BookOpen, 
  Award, 
  LogOut, 
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

const Sidebar: React.FC = () => {
  const { user, logout, announcements } = useApp(); // <-- pull announcements here
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  const navClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
      isActive ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
    }`;
  
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Mobile/Tablet Header Toggle - Visible below lg breakpoint */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-white border-b border-gray-100 z-30 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            SR
          </div>
          <h1 className="text-xl font-bold text-gray-800">StudiRad</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for Mobile/Tablet - Visible when menu open below lg */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        w-64 bg-white h-screen fixed left-0 top-0 shadow-xl flex flex-col z-40
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Desktop Header - Visible only on lg+ */}
        <div className="p-6 border-b border-gray-100 hidden lg:block">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              SF
            </div>
            <h1 className="text-xl font-bold text-gray-800">StudiRad</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1 ml-10 uppercase tracking-wider">
            {user.role === UserRole.ADMIN ? 'Administrator' : 'Student Portal'}
          </p>
        </div>

        {/* Mobile/Tablet Header inside sidebar */}
        <div className="p-6 border-b border-gray-100 lg:hidden flex items-center justify-between">
          <span className="font-bold text-gray-500">Menu</span>
          <button onClick={closeMobileMenu} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {user.role === UserRole.STUDENT && (
            <>
              <NavLink to="/dashboard" className={navClass} onClick={closeMobileMenu}>
                <LayoutDashboard size={20} />
                <span className="flex items-center">
                  Dashboard
                  {announcements.length > 0 && (
                    <span 
                      className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" 
                      title="New announcement" 
                    />
                  )}
                </span>
              </NavLink>

              <NavLink to="/study" className={navClass} onClick={closeMobileMenu}>
                <Target size={20} />
                <span>Study Room</span>
              </NavLink>
              <NavLink to="/roadmap" className={navClass} onClick={closeMobileMenu}>
                <BookOpen size={20} />
                <span>Roadmap</span>
              </NavLink>
              <NavLink to="/progress" className={navClass} onClick={closeMobileMenu}>
                <Award size={20} />
                <span>Progress</span>
              </NavLink>
            </>
          )}

          {user.role === UserRole.ADMIN && (
            <NavLink to="/admin" className={navClass} onClick={closeMobileMenu}>
              <ShieldCheck size={20} />
              <span>Admin Panel</span>
            </NavLink>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.points} PTS</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg w-full transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
