import React from 'react';
import { Activity } from 'lucide-react';
import type { Baselines } from '../types';

interface WellnessViewProps {
  baselines: Baselines;
  snapshot: any;
  onOpenCheckin: () => void;
}

export const WellnessView: React.FC<WellnessViewProps> = ({ baselines, snapshot, onOpenCheckin }) => {
  const energyBase = baselines?.energy_score;
  const moodBase = baselines?.mood_score;
  const stressBase = baselines?.stress_score;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Activity className="w-6 h-6 text-vital-500" />
            <span>Wellness & Subjective Ratings</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor daily energy, mood, stress, and fatigue scores to observe personal correlations.
          </p>
        </div>

        <button
          onClick={onOpenCheckin}
          className="px-4 py-2 rounded-xl bg-vital-600 hover:bg-vital-500 text-white font-bold text-xs shadow-soft"
        >
          Log Wellness
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <span className="text-xs font-semibold text-slate-500">Energy Baseline</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {energyBase?.avg ? `${energyBase.avg}/10` : '--'}
          </div>
          <div className="text-xs text-vital-600">
            Today: {snapshot?.wellness?.energy ? `${snapshot.wellness.energy}/10` : 'Not logged'}
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <span className="text-xs font-semibold text-slate-500">Mood Rating Baseline</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {moodBase?.avg ? `${moodBase.avg}/10` : '--'}
          </div>
          <div className="text-xs text-slate-500">
            Today: {snapshot?.wellness?.mood ? `${snapshot.wellness.mood}/10` : 'Not logged'}
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <span className="text-xs font-semibold text-slate-500">Stress Rating Baseline</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {stressBase?.avg ? `${stressBase.avg}/10` : '--'}
          </div>
          <div className="text-xs text-amber-600">
            Today: {snapshot?.wellness?.stress ? `${snapshot.wellness.stress}/10` : 'Not logged'}
          </div>
        </div>
      </div>
    </div>
  );
};
