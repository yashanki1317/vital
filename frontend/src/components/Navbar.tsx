import React from 'react';
import {
  Activity, LayoutDashboard, HeartPulse, Moon, Sun, Flame,
  TrendingUp, Clock, Sparkles, MessageSquareText, User as UserIcon, ShieldCheck,
  PlusCircle, LogOut, Eye
} from 'lucide-react';
import type { UserProfile } from '../types';
import { UPLOADS_BASE_URL } from '../services/api';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  isAuthenticated: boolean;
  onOpenCheckin: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  profile?: UserProfile | null;
  userName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  darkMode,
  setDarkMode,
  isDemoMode,
  toggleDemoMode,
  isAuthenticated,
  onOpenCheckin,
  onOpenAuth,
  onLogout,
  profile,
  userName
}) => {

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vitals', label: 'Vitals', icon: HeartPulse },
    { id: 'sleep', label: 'Sleep', icon: Moon },
    { id: 'activity', label: 'Activity', icon: Flame },
    { id: 'wellness', label: 'Wellness', icon: Activity },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'insights', label: 'AI Insights', icon: Sparkles },
    { id: 'ask-ai', label: 'Ask VITAL', icon: MessageSquareText },
  ];

  const avatarUrl = profile?.profile_picture_url
    ? (profile.profile_picture_url.startsWith('http') ? profile.profile_picture_url : `${UPLOADS_BASE_URL}${profile.profile_picture_url}`)
    : null;

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg h-[calc(100vh-2rem)] sticky top-0 z-40 p-4 justify-between select-none">
        <div>
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 px-3 py-2 cursor-pointer mb-6" onClick={() => setCurrentView('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-vital-600 to-emerald-400 flex items-center justify-center shadow-glow text-white font-black text-xl">
              V
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">VITAL</span>
              <span className="block text-[10px] font-semibold tracking-wider text-vital-600 dark:text-vital-400 uppercase">Health Platform</span>
            </div>
          </div>

          {/* Quick Check-in Button */}
          {(isAuthenticated || isDemoMode) && (
            <button
              onClick={onOpenCheckin}
              className="w-full mb-6 py-2.5 px-4 rounded-xl bg-gradient-to-r from-vital-600 to-vital-500 hover:from-vital-500 hover:to-vital-400 text-white font-medium text-sm shadow-soft flex items-center justify-center space-x-2 transition-all transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Daily Entry</span>
            </button>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-vital-50 dark:bg-vital-950/60 text-vital-700 dark:text-vital-300 font-semibold shadow-sm border border-vital-200/50 dark:border-vital-800/50'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-vital-600 dark:text-vital-400' : 'opacity-70'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Settings & Theme */}
        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
          {/* Demo Mode Toggle */}
          <button
            onClick={toggleDemoMode}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              isDemoMode
                ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>Demo Mode</span>
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${isDemoMode ? 'bg-amber-500 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
              {isDemoMode ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            <span className="flex items-center space-x-2">
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
            </span>
          </button>

          {/* Profile / Auth Button */}
          {isAuthenticated || isDemoMode ? (
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
              <button
                onClick={() => setCurrentView('profile')}
                className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-vital-600 truncate max-w-[130px]"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-vital-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className="truncate">{userName || 'Profile'}</span>
              </button>
              <button
                onClick={onLogout}
                title="Log Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs shadow-sm hover:opacity-95 transition-opacity"
            >
              Sign In / Register
            </button>
          )}

          {/* Privacy Link */}
          <button
            onClick={() => setCurrentView('privacy')}
            className="w-full text-center text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 pt-1 flex items-center justify-center space-x-1"
          >
            <ShieldCheck className="w-3 h-3 text-vital-500" />
            <span>Privacy & Disclaimer</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="flex items-center space-x-2" onClick={() => setCurrentView('dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-vital-600 to-emerald-400 flex items-center justify-center text-white font-extrabold text-base shadow-glow">
            V
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">VITAL</span>
        </div>

        <div className="flex items-center space-x-2">
          {(isAuthenticated || isDemoMode) && (
            <button
              onClick={onOpenCheckin}
              className="p-2 rounded-xl bg-vital-500 text-white text-xs font-semibold flex items-center space-x-1"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log</span>
            </button>
          )}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
          {!isAuthenticated && !isDemoMode && (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 text-xs font-semibold bg-vital-600 text-white rounded-lg"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-40 px-2 py-1.5 flex items-center justify-around">
        {[
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'trends', label: 'Trends', icon: TrendingUp },
          { id: 'timeline', label: 'Timeline', icon: Clock },
          { id: 'insights', label: 'AI', icon: Sparkles },
          { id: 'ask-ai', label: 'Chat', icon: MessageSquareText },
          { id: 'profile', label: 'Profile', icon: UserIcon }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-vital-600 dark:text-vital-400 font-bold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
