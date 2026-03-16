
import React from 'react';
import { LayoutDashboard, FileText, Settings, HelpCircle, Rocket, Users, Briefcase, LogOut, User } from 'lucide-react';
import { UserProfile } from '../firebase';

interface LayoutProps {
  children: React.ReactNode;
  activeView?: 'dashboard' | 'projects' | 'resource_dashboard' | 'resource_projects';
  onViewChange?: (view: 'dashboard' | 'projects' | 'resource_dashboard' | 'resource_projects') => void;
  user?: UserProfile | null;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView = 'dashboard', onViewChange, user, onLogout }) => {
  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm overflow-hidden border border-slate-200">
            <img 
              src="/logo.svg" 
              alt="BSS-PMO Logo" 
              className="w-full h-full object-contain p-1" 
              onError={(e) => {
                e.currentTarget.src = 'https://api.dicebear.com/7.x/initials/svg?seed=BSS&backgroundColor=4f46e5';
              }}
            />
          </div>
          <h1 className="font-bold text-xl tracking-tight">BSS-PMO</h1>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-6">
          <div className="space-y-1">
            <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Portfolio</h3>
            <button 
              onClick={() => onViewChange?.('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeView === 'dashboard' 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => onViewChange?.('projects')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeView === 'projects' 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Projects</span>
            </button>
          </div>

          <div className="space-y-1">
            <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Resources</h3>
            <button 
              onClick={() => onViewChange?.('resource_dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeView === 'resource_dashboard' 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => onViewChange?.('resource_projects')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeView === 'resource_projects' 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              <span>Projects</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-1">
          {user && (
            <div className="px-4 py-3 mb-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                  {user.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">{user.name}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user.role}</div>
                </div>
              </div>
            </div>
          )}
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
          <a href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <HelpCircle className="w-5 h-5" />
            <span>Help Center</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.svg" 
              alt="BSS-PMO Logo" 
              className="w-6 h-6 object-contain" 
              onError={(e) => {
                e.currentTarget.src = 'https://api.dicebear.com/7.x/initials/svg?seed=BSS&backgroundColor=4f46e5';
              }}
            />
            <div className="text-slate-500 text-sm font-medium">
              BSS-PMO: Enterprise Project Management System
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-600">
              <span className="sr-only">Notifications</span>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">🔔</div>
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
              PM
            </div>
          </div>
        </header>
        
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;