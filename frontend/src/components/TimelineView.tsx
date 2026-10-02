import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Moon, HeartPulse, ChevronRight, X, Trash2 } from 'lucide-react';
import type { DailyLog } from '../types';
import { api } from '../services/api';

export const TimelineView: React.FC = () => {
  const [timeline, setTimeline] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);
  const [deletingDate, setDeletingDate] = useState<string | null>(null);

  const fetchTimeline = () => {
    setLoading(true);
    api.getTimeline()
      .then((res) => setTimeline(res.timeline || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  const handleDeleteLog = async (dateStr: string) => {
    if (!window.confirm(`Are you sure you want to delete the daily log for ${dateStr}?`)) return;
    setDeletingDate(dateStr);
    try {
      await api.deleteDailyLog(dateStr);
      setSelectedLog(null);
      fetchTimeline();
    } catch (err) {
      alert('Failed to delete log entry.');
    } finally {
      setDeletingDate(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
          <Clock className="w-6 h-6 text-vital-500" />
          <span>Health Timeline</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Chronological record of your logged vitals, sleep, mood, activity, and symptoms.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading timeline...</div>
      ) : timeline.length === 0 ? (
        <div className="glass-card p-8 rounded-3xl text-center">
          <Calendar className="w-8 h-8 text-vital-500 mx-auto mb-2 opacity-50" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">No Timeline Logs Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Start logging your daily entries to build your chronological health feed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {timeline.map((log) => (
            <div
              key={log.id || log.log_date}
              onClick={() => setSelectedLog(log)}
              className="glass-card-hover p-5 rounded-2xl cursor-pointer border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-vital-500" />
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {log.log_date}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  {log.sleep && (
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center space-x-1">
                      <Moon className="w-3 h-3" />
                      <span>{log.sleep.hours_slept}h slept ({log.sleep.quality_score}/10)</span>
                    </span>
                  )}

                  {log.vital?.resting_hr && (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center space-x-1">
                      <HeartPulse className="w-3 h-3" />
                      <span>{log.vital.resting_hr} bpm</span>
                    </span>
                  )}

                  {log.vital?.bp_systolic && (
                    <span className="px-2.5 py-1 rounded-lg bg-vital-50 dark:bg-vital-950/60 text-vital-600 dark:text-vital-400">
                      BP {log.vital.bp_systolic}/{log.vital.bp_diastolic}
                    </span>
                  )}

                  {log.wellness && (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                      Energy {log.wellness.energy_score}/10 • Stress {log.wellness.stress_score}/10
                    </span>
                  )}

                  {log.symptoms && log.symptoms.length > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-300">
                      Symptoms: {log.symptoms.map(s => s.symptom_name).join(', ')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1 text-xs font-bold text-vital-600 dark:text-vital-400 self-end sm:self-center">
                <span>View Record</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Entry Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="glass-card w-full max-w-lg p-6 rounded-3xl relative shadow-glow border border-slate-200 dark:border-slate-800 space-y-4">
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Daily Record: {selectedLog.log_date}
            </h3>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              {selectedLog.vital && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950">
                  <div className="font-bold mb-1 text-vital-600">Vitals</div>
                  <div>Resting HR: {selectedLog.vital.resting_hr || '--'} bpm</div>
                  <div>BP: {selectedLog.vital.bp_systolic || '--'}/{selectedLog.vital.bp_diastolic || '--'} mmHg</div>
                  <div>Weight: {selectedLog.vital.weight_kg || '--'} kg</div>
                </div>
              )}

              {selectedLog.sleep && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950">
                  <div className="font-bold mb-1 text-indigo-500">Sleep</div>
                  <div>Duration: {selectedLog.sleep.hours_slept} hours</div>
                  <div>Quality Score: {selectedLog.sleep.quality_score}/10</div>
                  <div>Bedtime: {selectedLog.sleep.bedtime || '--'} • Wake: {selectedLog.sleep.wake_time || '--'}</div>
                </div>
              )}

              {selectedLog.wellness && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950">
                  <div className="font-bold mb-1 text-amber-500">Wellness</div>
                  <div>Energy: {selectedLog.wellness.energy_score}/10</div>
                  <div>Mood: {selectedLog.wellness.mood_score}/10</div>
                  <div>Stress: {selectedLog.wellness.stress_score}/10</div>
                  <div>Fatigue: {selectedLog.wellness.fatigue_score}/10</div>
                </div>
              )}

              {selectedLog.symptoms && selectedLog.symptoms.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200">
                  <div className="font-bold mb-1">Reported Symptoms</div>
                  <div>{selectedLog.symptoms.map(s => s.symptom_name).join(', ')}</div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => handleDeleteLog(selectedLog.log_date)}
                disabled={deletingDate === selectedLog.log_date}
                className="px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 hover:bg-red-100 font-semibold text-xs border border-red-200 dark:border-red-800 flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deletingDate === selectedLog.log_date ? 'Deleting...' : 'Delete Log Entry'}</span>
              </button>

              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
