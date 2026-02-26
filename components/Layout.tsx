
import React from 'react';
import { LayoutDashboard, FileText, Settings, HelpCircle, Rocket } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">BSS-PMO</h1>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-600/10 text-indigo-400 font-medium border border-indigo-500/20">
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <FileText className="w-5 h-5" />
            <span>Projects</span>
          </a>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-1">
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
          <div className="text-slate-500 text-sm">
            BSS-PMO: Enterprise Project Management System
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