import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Target, 
  BookOpen, 
  Award, 
  LogOut, 
  ShieldCheck 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

const Sidebar: React.FC = () => {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  const navClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
      isActive ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 shadow-xl flex flex-col z-10">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
            SF
          </div>
          <h1 className="text-xl font-bold text-gray-800">StudiRad</h1>
        </div>
        <p className="text-xs text-gray-400 mt-1 ml-10 uppercase tracking-wider">
          {user.role === UserRole.ADMIN ? 'Administrator' : 'Student Portal'}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {user.role === UserRole.STUDENT && (
          <>
            <NavLink to="/dashboard" className={navClass}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/study" className={navClass}>
              <Target size={20} />
              <span>Study Room</span>
            </NavLink>
            <NavLink to="/roadmap" className={navClass}>
              <BookOpen size={20} />
              <span>Roadmap</span>
            </NavLink>
            <NavLink to="/progress" className={navClass}>
              <Award size={20} />
              <span>Progress</span>
            </NavLink>
          </>
        )}

        {user.role === UserRole.ADMIN && (
          <NavLink to="/admin" className={navClass}>
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
  );
};

export default Sidebar;