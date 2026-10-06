import React from 'react';
import { 
  Building2, 
  Sparkles, 
  Search, 
  Sun, 
  Moon, 
  UserCheck, 
  GraduationCap,
  Sliders,
  History,
  Database,
  AlertCircle
} from 'lucide-react';

export default function Header({ 
  activeRole, 
  setActiveRole, 
  activeTab, 
  setActiveTab, 
  onOpenSearch, 
  isDarkMode, 
  setIsDarkMode,
  settings 
}) {
  const hasCollege = Boolean(settings?.college_name && settings?.college_name.trim());

  return (
    <header className="sticky top-0 z-40 bg-[#0b0f19]/80 backdrop-blur-xl border-b border-slate-800 text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            {settings?.college_logo ? (
              <img src={settings.college_logo} alt="College Logo" className="w-11 h-11 rounded-2xl object-cover border border-slate-700 shadow-md" />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[2px] shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-[#0b0f19] rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-white">
                  {hasCollege ? settings.college_name : "No College Setup"}
                </span>
                {!hasCollege && (
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Setup Needed
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">
                CampusPulse AI • {settings?.tag_line || "Turn Attendance Into Insight."}
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('staff')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'staff' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Staff Attendance
            </button>

            <button
              onClick={() => setActiveTab('principal')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'principal' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Principal View
            </button>

            <button
              onClick={() => setActiveTab('flyer-history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'flyer-history' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <History className="w-4 h-4" />
              Flyer History
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'admin' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Database className="w-4 h-4 text-cyan-400" />
              Admin Data Center
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-3">
            
            {/* Global Search Button */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all shadow-inner"
            >
              <Search className="w-4 h-4 text-cyan-400" />
              <span className="hidden lg:inline">Search student...</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
                Ctrl K
              </kbd>
            </button>

            {/* Role Switcher Dropdown */}
            <div className="relative group">
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-900/80 border border-indigo-500/30 rounded-xl cursor-pointer hover:border-indigo-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-slate-300">Role:</span>
                <span className="font-bold text-indigo-300">{activeRole}</span>
              </div>
              <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 hidden group-hover:block z-50">
                <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1">Switch View Role</div>
                <button
                  onClick={() => { setActiveRole('STAFF'); setActiveTab('staff'); }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-indigo-600/30 rounded-lg flex items-center gap-2"
                >
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" /> Staff Adviser
                </button>
                <button
                  onClick={() => { setActiveRole('PRINCIPAL'); setActiveTab('principal'); }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-indigo-600/30 rounded-lg flex items-center gap-2"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-purple-400" /> Principal View
                </button>
                <button
                  onClick={() => { setActiveRole('ADMIN'); setActiveTab('admin'); }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-indigo-600/30 rounded-lg flex items-center gap-2"
                >
                  <Database className="w-3.5 h-3.5 text-amber-400" /> Admin Data Center
                </button>
              </div>
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-all"
              title="Toggle Theme Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
