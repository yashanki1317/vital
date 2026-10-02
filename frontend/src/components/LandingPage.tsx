import React from 'react';
import {
  ShieldCheck, HeartPulse, Sparkles, Moon, Activity, ArrowRight, Eye, CheckCircle2
} from 'lucide-react';

interface LandingPageProps {
  onStartTracking: () => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartTracking,
  onExploreDemo
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-vital-50/20 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* Top Header Navigation */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-vital-600 to-emerald-400 flex items-center justify-center shadow-glow text-white font-black text-2xl">
            V
          </div>
          <div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">VITAL</span>
            <span className="block text-[10px] font-bold tracking-wider text-vital-600 dark:text-vital-400 uppercase">Personal Health Platform</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onExploreDemo}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1.5"
          >
            <Eye className="w-4 h-4 text-vital-500" />
            <span>Explore Demo</span>
          </button>
          <button
            onClick={onStartTracking}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-vital-600 hover:bg-vital-500 text-white shadow-soft transition-all transform hover:-translate-y-0.5"
          >
            Start Tracking
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-vital-100 dark:bg-vital-950/80 border border-vital-300/60 dark:border-vital-800 text-vital-800 dark:text-vital-300 text-xs font-semibold mb-8 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-vital-500" />
          <span>Universal Personal Health Analytics for Everyone</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
          Understand your health. <br />
          <span className="bg-gradient-to-r from-vital-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent">
            Not just your numbers.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
          VITAL brings your sleep, activity, vitals, mood, and everyday wellness data together so you can understand your personal patterns over time.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onStartTracking}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold bg-vital-600 hover:bg-vital-500 text-white shadow-glow transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
            <span>Start tracking free</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={onExploreDemo}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 hover:border-vital-500/50 shadow-soft transition-all flex items-center justify-center space-x-2"
          >
            <Eye className="w-5 h-5 text-vital-500" />
            <span>Explore Sample Dashboard</span>
          </button>
        </div>

        {/* Feature Preview Card Grid */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-soft-lg grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="p-4 rounded-2xl bg-vital-50/50 dark:bg-slate-800/40 border border-vital-100 dark:border-slate-800">
            <Moon className="w-6 h-6 text-vital-600 dark:text-vital-400 mb-2" />
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sleep Baseline</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">7h 24m</div>
            <div className="text-[11px] text-vital-600 dark:text-vital-400 font-medium mt-1">↑ 42m vs usual baseline</div>
          </div>

          <div className="p-4 rounded-2xl bg-vital-50/50 dark:bg-slate-800/40 border border-vital-100 dark:border-slate-800">
            <HeartPulse className="w-6 h-6 text-rose-500 mb-2" />
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Resting HR</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">71 bpm</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">Within usual range</div>
          </div>

          <div className="p-4 rounded-2xl bg-vital-50/50 dark:bg-slate-800/40 border border-vital-100 dark:border-slate-800">
            <Activity className="w-6 h-6 text-amber-500 mb-2" />
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Energy & Mood</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">8/10</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Peak energy window</div>
          </div>

          <div className="p-4 rounded-2xl bg-vital-50/50 dark:bg-slate-800/40 border border-vital-100 dark:border-slate-800">
            <Sparkles className="w-6 h-6 text-purple-500 mb-2" />
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Claude AI Insight</div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
              Sleep debt correlated with -1.4 drop in afternoon energy.
            </div>
            <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Non-diagnostic</div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
            How VITAL transforms health data
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Instead of comparing you to arbitrary global averages, VITAL helps you discover your own unique health patterns over time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 hover:border-vital-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-vital-100 dark:bg-vital-950/80 flex items-center justify-center text-vital-600 dark:text-vital-300 font-bold mb-6">
              01
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Fast 30-Second Check-ins</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
              Effortlessly log vitals, sleep hours, mood ratings, energy scores, physical activity, and symptoms without tedious clutter.
            </p>

            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-vital-500" /><span>Resting HR, Blood Pressure, SpO2, Weight</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-vital-500" /><span>Sleep quality, bedtime, awakenings</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-vital-500" /><span>Multi-select symptom tracking & notes</span></li>
            </ul>
          </div>

          <div className="glass-card p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 hover:border-vital-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-300 font-bold mb-6">
              02
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Personal Baseline System</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
              VITAL automatically calculates your rolling 30-day mean and standard deviation. Every new reading is compared against YOUR personal usual range.
            </p>

            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>No population assumptions</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>Empirical variance detection</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>Non-alarmist, calm observations</span></li>
            </ul>
          </div>

          <div className="glass-card p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 hover:border-vital-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/80 flex items-center justify-center text-purple-600 dark:text-purple-300 font-bold mb-6">
              03
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Analytics & Correlation Engine</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
              Discover how caffeine, exercise, sleep, and stress interact in your daily life.
            </p>

            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /><span>Co-occurrence matrix analysis</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /><span>Strict correlation vs causation distinction</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /><span>7d, 30d, 90d, 1y trend charts</span></li>
            </ul>
          </div>

          <div className="glass-card p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 hover:border-vital-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-amber-600 dark:text-amber-300 font-bold mb-6">
              04
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Claude AI Insights & Ask Your Data</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
              Claude AI analyzes your structured stats and answers your questions in clear, simple language.
            </p>

            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /><span>Ask: "Why has my energy been lower this week?"</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /><span>Server-side API key protection</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /><span>Strict non-diagnostic health boundaries</span></li>
            </ul>
          </div>
        </div>
      </section>

      {/* Safety & Medical Disclaimer Banner */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="p-3 rounded-xl bg-vital-500/10 text-vital-600 dark:text-vital-400 flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Empirical, Non-Diagnostic Platform</h4>
            <p>
              VITAL provides personalized health, wellness, and baseline pattern observations based strictly on your self-logged data. VITAL does not provide medical diagnoses, detect medical conditions, or replace professional healthcare evaluation. Always discuss persistent or concerning symptoms with a qualified physician.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-500 dark:text-slate-500">
        <p>© 2026 VITAL Health Analytics Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};
