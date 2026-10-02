import React from 'react';
import {
  Moon, HeartPulse, Activity, Flame, AlertCircle,
  PlusCircle, Sparkles, Info, ChevronRight, CalendarCheck
} from 'lucide-react';
import type { UserProfile, Baselines, NoticeAlert, AIInsightItem } from '../types';

interface HomeDashboardProps {
  profile: UserProfile | null;
  snapshot: any;
  baselines: Baselines;
  alerts: NoticeAlert[];
  recentInsights: AIInsightItem[];
  totalDaysLogged: number;
  sufficientData: boolean;
  emptyStateMessage: string | null;
  onOpenCheckin: () => void;
  onNavigateView: (view: string) => void;
  isDemoMode: boolean;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  profile,
  snapshot,
  baselines,
  alerts,
  recentInsights,
  totalDaysLogged,
  sufficientData,
  emptyStateMessage,
  onOpenCheckin,
  onNavigateView,
  isDemoMode
}) => {
  const userName = profile?.name || 'Friend';
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const isNewUserNoData = totalDaysLogged === 0 && !isDemoMode;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {getGreeting()}, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isNewUserNoData
              ? "Your health dashboard is ready."
              : "Here is your personal health baseline snapshot for today."}
          </p>
        </div>

        <button
          onClick={onOpenCheckin}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-vital-600 to-vital-500 hover:from-vital-500 hover:to-vital-400 text-white font-bold text-sm shadow-soft flex items-center justify-center space-x-2 transition-all transform active:scale-95 self-start sm:self-auto"
        >
          <PlusCircle className="w-5 h-5" />
          <span>{isNewUserNoData ? 'Start your first check-in' : 'Quick Daily Check-in'}</span>
        </button>
      </div>

      {/* New User Zero-Data Empty State Banner */}
      {isNewUserNoData && (
        <div className="glass-card p-8 rounded-3xl border border-vital-300 dark:border-vital-800 bg-gradient-to-br from-vital-50/80 via-emerald-50/40 to-slate-50 dark:from-vital-950/40 dark:via-slate-900 dark:to-slate-950 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-glow">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-vital-100 dark:bg-vital-900/80 text-vital-700 dark:text-vital-300 text-xs font-bold">
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Welcome to VITAL</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Your health dashboard is ready.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Start your first check-in to begin building your personal health history. VITAL uses your actual entries to compute personal baselines rather than preset average values.
            </p>
          </div>

          <button
            onClick={onOpenCheckin}
            className="px-6 py-3.5 rounded-2xl bg-vital-600 hover:bg-vital-500 text-white font-extrabold text-sm shadow-soft transition-all transform hover:scale-105 flex-shrink-0"
          >
            Start your first check-in
          </button>
        </div>
      )}

      {/* Baseline Forming State (Some data, but < 3 days) */}
      {!sufficientData && totalDaysLogged > 0 && !isDemoMode && (
        <div className="glass-card p-6 rounded-3xl border border-vital-200 dark:border-vital-800 bg-vital-50/50 dark:bg-vital-950/30 flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="p-3 rounded-2xl bg-vital-500 text-white shadow-glow flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Your Personal Baseline is Forming
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {emptyStateMessage || "Log a few more daily entries. VITAL calculates your personal baselines dynamically from your own historical data."}
            </p>
            <div className="mt-4 flex items-center space-x-3">
              <button
                onClick={onOpenCheckin}
                className="px-4 py-2 rounded-xl bg-vital-600 text-white text-xs font-bold hover:bg-vital-500 transition-colors"
              >
                Log Today's Entry
              </button>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {totalDaysLogged} day{totalDaysLogged === 1 ? '' : 's'} logged so far
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Snapshot Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Today's Health Snapshot</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {isNewUserNoData ? 'No health statistics yet' : 'Compared to your 30-day baseline'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigateView('sleep')}
            className="glass-card-hover p-5 rounded-2xl cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sleep</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Moon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {snapshot?.sleep?.formatted || (snapshot?.sleep?.value ? `${snapshot.sleep.value}h` : 'No sleep data yet')}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 truncate">
              {snapshot?.sleep?.comparison || (baselines?.hours_slept?.avg ? `Baseline: ${baselines.hours_slept.avg}h` : 'Log your first sleep entry')}
            </div>
          </div>

          <div
            onClick={() => onNavigateView('vitals')}
            className="glass-card-hover p-5 rounded-2xl cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Resting HR</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <HeartPulse className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {snapshot?.resting_hr?.value ? `${snapshot.resting_hr.value} bpm` : 'No heart-rate data yet'}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 truncate">
              {snapshot?.resting_hr?.comparison || (baselines?.resting_hr?.avg ? `Baseline: ${baselines.resting_hr.avg} bpm` : 'Log your first heart rate')}
            </div>
          </div>

          <div
            onClick={() => onNavigateView('vitals')}
            className="glass-card-hover p-5 rounded-2xl cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Blood Pressure</span>
              <div className="w-8 h-8 rounded-xl bg-vital-50 dark:bg-vital-950/60 text-vital-600 dark:text-vital-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {snapshot?.blood_pressure?.formatted || 'No BP data yet'}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 truncate">
              {snapshot?.blood_pressure?.systolic ? 'Logged today' : 'Log blood pressure entry'}
            </div>
          </div>

          <div
            onClick={() => onNavigateView('wellness')}
            className="glass-card-hover p-5 rounded-2xl cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Energy & Mood</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {snapshot?.wellness?.energy ? `${snapshot.wellness.energy}/10` : 'No wellness data yet'}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 truncate">
              {snapshot?.wellness?.mood ? `Mood: ${snapshot.wellness.mood}/10` : 'Log daily mood & energy'}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts && alerts.length > 0 && !isNewUserNoData && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-vital-500" />
            <span>Things to Notice</span>
          </h2>

          <div className="space-y-2.5">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border text-xs leading-relaxed flex items-start space-x-3 transition-all ${
                  alert.severity === 'warning'
                    ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                    : alert.severity === 'notice'
                    ? 'bg-vital-50/80 dark:bg-vital-950/40 border-vital-200 dark:border-vital-800 text-vital-900 dark:text-vital-200'
                    : 'bg-slate-100/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-vital-500" />
                <div className="flex-1">
                  <div className="font-bold mb-0.5">{alert.title}</div>
                  <div>{alert.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personal Baselines Card */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              30-Day Personal Baseline Averages
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calculated dynamically from your actual database records.
            </p>
          </div>
          <button
            onClick={() => onNavigateView('trends')}
            className="text-xs font-bold text-vital-600 dark:text-vital-400 hover:underline flex items-center space-x-1"
          >
            <span>View Full Trends</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Resting HR Range</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {baselines?.resting_hr?.range_low ? `${baselines.resting_hr.range_low} - ${baselines.resting_hr.range_high} bpm` : 'No data yet'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Sleep Average</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {baselines?.hours_slept?.avg ? `${baselines.hours_slept.avg} hrs/night` : 'No data yet'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Energy Average</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {baselines?.energy_score?.avg ? `${baselines.energy_score.avg}/10` : 'No data yet'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Stress Average</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {baselines?.stress_score?.avg ? `${baselines.stress_score.avg}/10` : 'No data yet'}
            </span>
          </div>
        </div>
      </div>

      {/* AI Insights Teaser */}
      {recentInsights && recentInsights.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-vital-500" />
              <span>VITAL AI Observations</span>
            </h2>
            <button
              onClick={() => onNavigateView('insights')}
              className="text-xs font-bold text-vital-600 dark:text-vital-400 hover:underline flex items-center space-x-1"
            >
              <span>All Insights</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentInsights.map((insight) => (
              <div
                key={insight.id}
                onClick={() => onNavigateView('insights')}
                className="glass-card-hover p-5 rounded-2xl cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-vital-100 dark:bg-vital-950 text-vital-700 dark:text-vital-300 text-[10px] font-bold uppercase">
                      {insight.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {insight.observation_type}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">
                    {insight.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {insight.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
