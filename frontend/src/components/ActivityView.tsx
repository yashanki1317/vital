import React from 'react';
import { Flame } from 'lucide-react';
import type { Baselines } from '../types';

interface ActivityViewProps {
  baselines: Baselines;
  snapshot: any;
  onOpenCheckin: () => void;
}

export const ActivityView: React.FC<ActivityViewProps> = ({ baselines, snapshot, onOpenCheckin }) => {
  const stepsBase = baselines?.steps;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Flame className="w-6 h-6 text-amber-500" />
            <span>Physical Activity</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track daily steps, exercise duration, and movement trends.
          </p>
        </div>

        <button
          onClick={onOpenCheckin}
          className="px-4 py-2 rounded-xl bg-vital-600 hover:bg-vital-500 text-white font-bold text-xs shadow-soft"
        >
          Log Activity
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <span className="text-xs font-semibold text-slate-500">Today's Steps</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {snapshot?.activity?.steps ? `${snapshot.activity.steps.toLocaleString()} steps` : '--'}
          </div>
          <div className="text-xs text-vital-600">
            Exercise: {snapshot?.activity?.exercise_mins ? `${snapshot.activity.exercise_mins} mins (${snapshot.activity.exercise_type || 'Active'})` : 'None logged today'}
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <span className="text-xs font-semibold text-slate-500">30-Day Step Baseline</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {stepsBase?.avg ? `${Math.round(stepsBase.avg).toLocaleString()} steps/day` : 'Forming...'}
          </div>
          <div className="text-xs text-slate-500">
            Usual range: {stepsBase?.range_low != null && stepsBase?.range_high != null ? `${Math.round(stepsBase.range_low)} - ${Math.round(stepsBase.range_high)}` : '--'}
          </div>
        </div>
      </div>
    </div>
  );
};
