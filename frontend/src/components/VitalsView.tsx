import React from 'react';
import { HeartPulse, Activity, Scale, ShieldCheck } from 'lucide-react';
import type { Baselines } from '../types';

interface VitalsViewProps {
  baselines: Baselines;
  snapshot: any;
  onOpenCheckin: () => void;
}

export const VitalsView: React.FC<VitalsViewProps> = ({ baselines, snapshot, onOpenCheckin }) => {
  const rhrBase = baselines?.resting_hr;
  const sysBase = baselines?.bp_systolic;
  const diaBase = baselines?.bp_diastolic;
  const weightBase = baselines?.weight_kg;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <HeartPulse className="w-6 h-6 text-rose-500" />
            <span>Vitals Dashboard</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track your resting heart rate, blood pressure, SpO2, temperature, and weight against personal ranges.
          </p>
        </div>

        <button
          onClick={onOpenCheckin}
          className="px-4 py-2 rounded-xl bg-vital-600 hover:bg-vital-500 text-white font-bold text-xs shadow-soft"
        >
          Log Vitals
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Resting HR Card */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Resting HR</span>
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {snapshot?.resting_hr?.value ? `${snapshot.resting_hr.value} bpm` : '--'}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
            30-Day Baseline: <span className="font-bold">{rhrBase?.avg ? `${rhrBase.avg} bpm` : 'Forming...'}</span>
            {rhrBase?.range_low && <div className="text-[11px] text-vital-600">Usual range: {rhrBase.range_low} - {rhrBase.range_high} bpm</div>}
          </div>
        </div>

        {/* Blood Pressure Card */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Blood Pressure</span>
            <div className="p-2 rounded-xl bg-vital-100 dark:bg-vital-950/60 text-vital-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {snapshot?.blood_pressure?.formatted || '--'}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
            Baseline Sys/Dia: <span className="font-bold">{sysBase?.avg ? `${sysBase.avg}/${diaBase?.avg || '--'} mmHg` : 'Forming...'}</span>
          </div>
        </div>

        {/* Weight Card */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Weight</span>
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {weightBase?.avg ? `${weightBase.avg} kg` : '--'}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
            30-Day Range: <span className="font-bold">{weightBase?.min ? `${weightBase.min} - ${weightBase.max} kg` : 'Forming...'}</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-vital-500 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-slate-900 dark:text-white mb-0.5">Non-Diagnostic Vitals Tracking</span>
          <span>
            VITAL presents historical vitals trends relative to your calculated personal baseline. If you notice persistent high blood pressure or unusual heart rate readings, consider discussing them with a healthcare professional.
          </span>
        </div>
      </div>
    </div>
  );
};
