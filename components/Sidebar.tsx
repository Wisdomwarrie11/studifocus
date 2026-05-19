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
  X,
  Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

const Sidebar: React.FC = () => {
  const { user, logout, announcements, deferredPrompt, setDeferredPrompt } = useApp();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
  };

  if (!user) return null;

  const navClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
      isActive ? 'bg-brand-orange text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
    }`;
  
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Mobile/Tablet Header Toggle - Visible below lg breakpoint */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-white border-b border-gray-100 z-30 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center text-white font-bold shadow-sm shadow-brand-orange/20">
            SF
          </div>
          <h1 className="text-xl font-bold text-deep-blue">StudiFocus</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for Mobile/Tablet - Visible when menu open below lg */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-deep-blue/40 backdrop-blur-sm z-30 lg:hidden transition-all duration-300"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        w-64 bg-white h-screen fixed left-0 top-0 shadow-xl flex flex-col z-40
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 border-r border-gray-100
      `}>
        {/* Desktop Header - Visible only on lg+ */}
        <div className="p-6 border-b border-gray-100 hidden lg:block bg-gradient-to-br from-white to-gray-50">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-brand-orange/30">
              SF
            </div>
            <div>
               <h1 className="text-xl font-bold text-deep-blue leading-tight">StudiFocus</h1>
               <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                {user.role === UserRole.ADMIN ? 'Administrator' : 'Student Portal'}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Header inside sidebar */}
        <div className="p-6 border-b border-gray-100 lg:hidden flex items-center justify-between">
          <span className="font-bold text-deep-blue">Menu</span>
          <button onClick={closeMobileMenu} className="text-gray-400 hover:text-deep-blue transition-colors">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {user.role === UserRole.STUDENT && (
            <>
              <NavLink to="/dashboard" className={navClass} onClick={closeMobileMenu}>
                <LayoutDashboard size={20} />
                <span className="flex items-center flex-1">
                  Dashboard
                  {announcements.length > 0 && (
                    <span 
                      className="ml-auto w-2 h-2 bg-brand-orange rounded-full animate-pulse" 
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

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          {deferredPrompt && (
            <button 
              onClick={handleInstallClick}
              className="flex items-center space-x-3 px-4 py-2.5 mb-2 text-deep-blue bg-brand-orange/10 hover:bg-brand-orange/20 rounded-xl w-full transition-all group font-bold border border-brand-orange/20"
            >
              <Smartphone size={20} className="text-brand-orange" />
              <span className="text-sm">Install App</span>
            </button>
          )}
          <div className="flex items-center space-x-3 px-4 py-3 mb-2 rounded-xl border border-transparent hover:border-gray-200 transition-all cursor-default">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-orange to-deep-blue flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-deep-blue truncate">{user.name}</p>
              <p className="text-[10px] text-brand-orange font-bold uppercase tracking-wider">{user.points} PTS</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl w-full transition-all group font-medium"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
