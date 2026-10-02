import React from 'react';
import { Moon } from 'lucide-react';
import type { Baselines } from '../types';

interface SleepViewProps {
  baselines: Baselines;
  snapshot: any;
  onOpenCheckin: () => void;
}

export const SleepView: React.FC<SleepViewProps> = ({ baselines, snapshot, onOpenCheckin }) => {
  const sleepBase = baselines?.hours_slept;
  const qualBase = baselines?.sleep_quality;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Moon className="w-6 h-6 text-indigo-500" />
            <span>Sleep & Recovery</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor sleep duration, quality scores, bedtime consistency, and awakenings.
          </p>
        </div>

        <button
          onClick={onOpenCheckin}
          className="px-4 py-2 rounded-xl bg-vital-600 hover:bg-vital-500 text-white font-bold text-xs shadow-soft"
        >
          Log Sleep
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <span className="text-xs font-semibold text-slate-500">Sleep Duration</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {snapshot?.sleep?.formatted || (sleepBase?.avg ? `${sleepBase.avg} hrs` : '--')}
          </div>
          <div className="text-xs text-vital-600 dark:text-vital-400">
            {snapshot?.sleep?.comparison || 'Personal baseline range'}
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <span className="text-xs font-semibold text-slate-500">30-Day Baseline Avg</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {sleepBase?.avg ? `${sleepBase.avg} hrs/night` : 'Forming...'}
          </div>
          <div className="text-xs text-slate-500">
            Range: {sleepBase?.range_low ? `${sleepBase.range_low} - ${sleepBase.range_high} hrs` : '--'}
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <span className="text-xs font-semibold text-slate-500">Sleep Quality Avg</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {qualBase?.avg ? `${qualBase.avg}/10` : '--'}
          </div>
          <div className="text-xs text-slate-500">
            Based on logged quality ratings
          </div>
        </div>
      </div>
    </div>
  );
};
