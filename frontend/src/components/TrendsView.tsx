import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, ReferenceLine
} from 'recharts';
import { TrendingUp, Info, BarChart2 } from 'lucide-react';
import type { TrendSeriesPoint, Baselines } from '../types';
import { api } from '../services/api';

interface TrendsViewProps {
  baselines: Baselines;
}

export const TrendsView: React.FC<TrendsViewProps> = ({ baselines }) => {
  const [range, setRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<string>('hours_slept');
  const [seriesData, setSeriesData] = useState<TrendSeriesPoint[]>([]);
  const [summaries, setSummaries] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.getTrends(range)
      .then((res) => {
        setSeriesData(res.chart_series || []);
        setSummaries(res.written_summaries || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [range]);

  const metricsConfig: Record<string, { label: string; unit: string; color: string; key: keyof TrendSeriesPoint; type: 'line' | 'bar' }> = {
    hours_slept: { label: 'Sleep Duration', unit: 'hrs', color: '#6366f1', key: 'hours_slept', type: 'line' },
    resting_hr: { label: 'Resting Heart Rate', unit: 'bpm', color: '#f43f5e', key: 'resting_hr', type: 'line' },
    bp_systolic: { label: 'Blood Pressure (Systolic)', unit: 'mmHg', color: '#e11d48', key: 'bp_systolic', type: 'line' },
    bp_diastolic: { label: 'Blood Pressure (Diastolic)', unit: 'mmHg', color: '#0284c7', key: 'bp_diastolic', type: 'line' },
    energy_score: { label: 'Energy Score', unit: '/10', color: '#10b981', key: 'energy_score', type: 'line' },
    mood_score: { label: 'Mood Rating', unit: '/10', color: '#14b8a6', key: 'mood_score', type: 'line' },
    stress_score: { label: 'Stress Level', unit: '/10', color: '#f59e0b', key: 'stress_score', type: 'line' },
    steps: { label: 'Daily Steps', unit: 'steps', color: '#3b82f6', key: 'steps', type: 'bar' },
    water_ml: { label: 'Water Intake', unit: 'ml', color: '#06b6d4', key: 'water_ml', type: 'bar' },
    weight_kg: { label: 'Weight', unit: 'kg', color: '#8b5cf6', key: 'weight_kg', type: 'line' },
  };

  const activeMetric = metricsConfig[selectedMetric] || metricsConfig['hours_slept'];

  const baselineKeyMap: Record<string, keyof Baselines> = {
    hours_slept: 'hours_slept',
    resting_hr: 'resting_hr',
    bp_systolic: 'bp_systolic',
    bp_diastolic: 'bp_diastolic',
    energy_score: 'energy_score',
    mood_score: 'mood_score',
    stress_score: 'stress_score',
    steps: 'steps',
    water_ml: 'water_ml',
    weight_kg: 'weight_kg'
  };

  const currentBaselineInfo = baselines?.[baselineKeyMap[selectedMetric] as keyof Baselines] as any;

  // Filter series to check if user has logged data for this specific metric
  const validDataPoints = seriesData.filter(d => d[activeMetric.key] !== null && d[activeMetric.key] !== undefined);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* Title & Range Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-vital-500" />
            <span>Personal Health Trends</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Graphs generated dynamically strictly from your personal database logs.
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
          {(['7d', '30d', '90d', '1y'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                range === r
                  ? 'bg-white dark:bg-slate-900 text-vital-600 dark:text-vital-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto py-1 no-scrollbar">
        {Object.entries(metricsConfig).map(([mKey, mCfg]) => (
          <button
            key={mKey}
            onClick={() => setSelectedMetric(mKey)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedMetric === mKey
                ? 'bg-vital-600 text-white border-vital-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-vital-500/50'
            }`}
          >
            {mCfg.label}
          </button>
        ))}
      </div>

      {/* Main Chart Card */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {activeMetric.label} ({range.toUpperCase()})
            </h3>
            {currentBaselineInfo?.avg && (
              <span className="text-xs text-vital-600 dark:text-vital-400 font-semibold">
                Personal Baseline Avg: {currentBaselineInfo.avg} {activeMetric.unit} (Range: {currentBaselineInfo.range_low} - {currentBaselineInfo.range_high})
              </span>
            )}
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {validDataPoints.length} logged point{validDataPoints.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Interactive Chart */}
        <div className="h-72 sm:h-80 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Loading trends from database...
            </div>
          ) : validDataPoints.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 p-6 text-center">
              <BarChart2 className="w-10 h-10 text-slate-300 dark:text-slate-700" />
              <div className="font-bold text-sm text-slate-600 dark:text-slate-400">
                No {activeMetric.label.toLowerCase()} data available yet.
              </div>
              <p className="text-xs text-slate-400 max-w-sm">
                Log entries in your daily check-in to see your personal {activeMetric.label.toLowerCase()} graph update automatically.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {activeMetric.type === 'line' ? (
                <LineChart data={seriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any) => [`${val} ${activeMetric.unit}`, activeMetric.label]}
                  />
                  {currentBaselineInfo?.avg && (
                    <ReferenceLine y={currentBaselineInfo.avg} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Baseline', fill: '#10b981', fontSize: 10 }} />
                  )}
                  <Line
                    type="monotone"
                    dataKey={activeMetric.key as string}
                    stroke={activeMetric.color}
                    strokeWidth={3}
                    connectNulls
                    dot={{ r: 4, fill: activeMetric.color }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={seriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any) => [`${val} ${activeMetric.unit}`, activeMetric.label]}
                  />
                  <Bar dataKey={activeMetric.key as string} fill={activeMetric.color} radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>

        {/* Written Summary */}
        {summaries && summaries.length > 0 && validDataPoints.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-vital-500" />
              <span>Written Trend Interpretation</span>
            </h4>
            <div className="space-y-1">
              {summaries.map((s, idx) => (
                <p key={idx} className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {s}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
