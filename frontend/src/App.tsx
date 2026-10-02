import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { DailyCheckinModal } from './components/DailyCheckinModal';
import { HomeDashboard } from './components/HomeDashboard';
import { VitalsView } from './components/VitalsView';
import { SleepView } from './components/SleepView';
import { ActivityView } from './components/ActivityView';
import { WellnessView } from './components/WellnessView';
import { TrendsView } from './components/TrendsView';
import { TimelineView } from './components/TimelineView';
import { InsightsView } from './components/InsightsView';
import { AskAIView } from './components/AskAIView';
import { ProfileSettingsView } from './components/ProfileSettingsView';
import { PrivacyPage } from './components/PrivacyPage';

import type { User, UserProfile, Baselines, NoticeAlert, AIInsightItem } from './types';
import { api } from './services/api';

export function App() {
  const [currentView, setCurrentView] = useState<string>(() => {
    const path = window.location.pathname.replace('/', '') || 'landing';
    if (['dashboard', 'vitals', 'sleep', 'activity', 'wellness', 'trends', 'timeline', 'insights', 'ask-ai', 'chat', 'profile', 'settings', 'privacy'].includes(path)) {
      return path === 'chat' ? 'ask-ai' : path === 'settings' ? 'profile' : path;
    }
    return 'landing';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('vital_theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(api.getDemoMode());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Boolean(api.getToken()));
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);

  // Dashboard Data State
  const [dashboardData, setDashboardData] = useState<{
    snapshot: any;
    baselines: Baselines;
    alerts: NoticeAlert[];
    recentInsights: AIInsightItem[];
    totalDaysLogged: number;
    sufficientData: boolean;
    emptyStateMessage: string | null;
  }>({
    snapshot: null,
    baselines: {},
    alerts: [],
    recentInsights: [],
    totalDaysLogged: 0,
    sufficientData: false,
    emptyStateMessage: null
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vital_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vital_theme', 'light');
    }
  }, [darkMode]);

  const loadUserAndProfile = async () => {
    if (api.getToken()) {
      try {
        const meRes = await api.getMe();
        setUser(meRes.user);
        setIsAuthenticated(true);

        const profRes = await api.getProfile();
        setProfile(profRes.profile);
        if (!profRes.onboarding_completed && !isDemoMode) {
          setIsOnboardingOpen(true);
        } else if (currentView === 'landing') {
          setCurrentView('dashboard');
        }
      } catch (err) {
        console.error('Session expired or error loading profile', err);
        setIsAuthenticated(false);
        api.setToken(null);
      }
    } else if (isDemoMode) {
      if (currentView === 'landing') {
        setCurrentView('dashboard');
      }
    }
  };

  useEffect(() => {
    loadUserAndProfile();
  }, [isDemoMode]);

  const loadDashboardData = async () => {
    try {
      const res = await api.getDashboardData();
      if (res.profile) {
        setProfile(res.profile);
      }
      setDashboardData({
        snapshot: res.snapshot,
        baselines: res.baselines,
        alerts: res.alerts,
        recentInsights: res.recent_insights,
        totalDaysLogged: res.total_days_logged,
        sufficientData: res.sufficient_data,
        emptyStateMessage: res.empty_state_message
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    if (currentView !== 'landing' && (isAuthenticated || isDemoMode)) {
      loadDashboardData();
    }
  }, [currentView, isAuthenticated, isDemoMode]);

  const handleAuthSuccess = (_token: string, u: User) => {
    setUser(u);
    setIsAuthenticated(true);
    api.setDemoMode(false);
    setIsDemoMode(false);

    api.getProfile().then((profRes) => {
      setProfile(profRes.profile);
      if (!profRes.onboarding_completed) {
        setIsOnboardingOpen(true);
      } else {
        setCurrentView('dashboard');
      }
    });
  };

  const toggleDemoMode = () => {
    const nextDemo = !isDemoMode;
    api.setDemoMode(nextDemo);
    setIsDemoMode(nextDemo);
    if (nextDemo) {
      setCurrentView('dashboard');
    } else if (!isAuthenticated) {
      setCurrentView('landing');
    }
  };

  const handleLogout = () => {
    api.setToken(null);
    setIsAuthenticated(false);
    setUser(null);
    setProfile(null);
    if (!isDemoMode) {
      setCurrentView('landing');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      
      {/* Top Demo Banner across full width */}
      {isDemoMode && currentView !== 'landing' && (
        <div className="bg-amber-500/90 text-amber-950 font-medium text-xs sm:text-sm px-4 py-1.5 text-center flex items-center justify-center space-x-2 shadow-sm z-50 sticky top-0">
          <Eye className="w-4 h-4" />
          <span><strong>Demo Data Mode</strong> — Synthetic sample logs for preview only. Real accounts contain zero sample data.</span>
          <button
            onClick={toggleDemoMode}
            className="ml-3 underline hover:opacity-80 font-semibold text-xs"
          >
            Exit Demo
          </button>
        </div>
      )}

      <div className="flex flex-1 flex-col md:flex-row">
        {currentView !== 'landing' && (
          <Navbar
            currentView={currentView}
            setCurrentView={setCurrentView}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            isDemoMode={isDemoMode}
            toggleDemoMode={toggleDemoMode}
            isAuthenticated={isAuthenticated}
            onOpenCheckin={() => setIsCheckinOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
            onLogout={handleLogout}
            profile={profile}
            userName={profile?.name || user?.email}
          />
        )}

        <main className={`flex-1 ${currentView !== 'landing' ? 'p-4 sm:p-8 max-w-7xl mx-auto w-full' : ''}`}>
          
          {currentView === 'landing' && (
            <LandingPage
              onStartTracking={() => setIsAuthOpen(true)}
              onExploreDemo={() => {
                api.setDemoMode(true);
                setIsDemoMode(true);
                setCurrentView('dashboard');
              }}
            />
          )}

          {currentView === 'dashboard' && (
            <HomeDashboard
              profile={profile}
              snapshot={dashboardData.snapshot}
              baselines={dashboardData.baselines}
              alerts={dashboardData.alerts}
              recentInsights={dashboardData.recentInsights}
              totalDaysLogged={dashboardData.totalDaysLogged}
              sufficientData={dashboardData.sufficientData}
              emptyStateMessage={dashboardData.emptyStateMessage}
              onOpenCheckin={() => setIsCheckinOpen(true)}
              onNavigateView={setCurrentView}
              isDemoMode={isDemoMode}
            />
          )}

          {currentView === 'vitals' && (
            <VitalsView
              baselines={dashboardData.baselines}
              snapshot={dashboardData.snapshot}
              onOpenCheckin={() => setIsCheckinOpen(true)}
            />
          )}

          {currentView === 'sleep' && (
            <SleepView
              baselines={dashboardData.baselines}
              snapshot={dashboardData.snapshot}
              onOpenCheckin={() => setIsCheckinOpen(true)}
            />
          )}

          {currentView === 'activity' && (
            <ActivityView
              baselines={dashboardData.baselines}
              snapshot={dashboardData.snapshot}
              onOpenCheckin={() => setIsCheckinOpen(true)}
            />
          )}

          {currentView === 'wellness' && (
            <WellnessView
              baselines={dashboardData.baselines}
              snapshot={dashboardData.snapshot}
              onOpenCheckin={() => setIsCheckinOpen(true)}
            />
          )}

          {currentView === 'trends' && (
            <TrendsView baselines={dashboardData.baselines} />
          )}

          {currentView === 'timeline' && (
            <TimelineView />
          )}

          {currentView === 'insights' && (
            <InsightsView />
          )}

          {(currentView === 'ask-ai' || currentView === 'chat') && (
            <AskAIView />
          )}

          {(currentView === 'profile' || currentView === 'settings') && (
            <ProfileSettingsView
              profile={profile}
              onUpdateProfile={(p) => setProfile(p)}
              onLogout={handleLogout}
            />
          )}

          {currentView === 'privacy' && (
            <PrivacyPage />
          )}

        </main>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        onSelectDemo={() => {
          api.setDemoMode(true);
          setIsDemoMode(true);
          setCurrentView('dashboard');
        }}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={(p) => {
          setProfile(p);
          setIsOnboardingOpen(false);
          setCurrentView('dashboard');
        }}
      />

      <DailyCheckinModal
        isOpen={isCheckinOpen}
        onClose={() => setIsCheckinOpen(false)}
        onSaved={() => {
          loadDashboardData();
        }}
        profile={profile}
      />

    </div>
  );
}

export default App;
