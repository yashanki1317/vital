import React, { useState, useEffect } from 'react';
import {
  X, HeartPulse, Moon, Activity, Flame, Coffee, AlertCircle, Check, Calendar, Droplets
} from 'lucide-react';
import type { DailyLog, UserProfile } from '../types';
import { api } from '../services/api';

interface DailyCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (log: DailyLog) => void;
  profile?: UserProfile | null;
}

export const DailyCheckinModal: React.FC<DailyCheckinModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  profile
}) => {
  const [activeTab, setActiveTab] = useState<'vitals' | 'sleep' | 'wellness' | 'activity' | 'lifestyle' | 'symptoms' | 'cycle'>('vitals');
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vitals State
  const [restingHr, setRestingHr] = useState<number | ''>('');
  const [bpSystolic, setBpSystolic] = useState<number | ''>('');
  const [bpDiastolic, setBpDiastolic] = useState<number | ''>('');
  const [spo2, setSpo2] = useState<number | ''>('');
  const [temperature, setTemperature] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');

  // Sleep State
  const [hoursSlept, setHoursSlept] = useState<number>(7.5);
  const [sleepQuality, setSleepQuality] = useState<number>(7);
  const [bedtime, setBedtime] = useState<string>('23:00');
  const [wakeTime, setWakeTime] = useState<string>('07:00');
  const [awakenings, setAwakenings] = useState<number>(0);

  // Wellness State
  const [energyScore, setEnergyScore] = useState<number>(7);
  const [moodScore, setMoodScore] = useState<number>(7);
  const [stressScore, setStressScore] = useState<number>(4);
  const [fatigueScore, setFatigueScore] = useState<number>(3);

  // Activity State
  const [steps, setSteps] = useState<number>(8000);
  const [exerciseMins, setExerciseMins] = useState<number>(30);
  const [exerciseType, setExerciseType] = useState<string>('Brisk Walk');
  const [activityLevel, setActivityLevel] = useState<string>('Moderate');

  // Lifestyle State
  const [waterMl, setWaterMl] = useState<number>(2000);
  const [caffeineMg, setCaffeineMg] = useState<number>(150);
  const [alcoholUnits, setAlcoholUnits] = useState<number>(0);
  const [nicotineUsed, setNicotineUsed] = useState<boolean>(false);
  const [nutritionNotes, setNutritionNotes] = useState<string>('');

  // Symptoms State
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomNotes, setSymptomNotes] = useState<string>('');

  // Cycle State
  const [isPeriodDay, setIsPeriodDay] = useState<boolean>(false);
  const [flowLevel, setFlowLevel] = useState<string>('Light');
  const [crampsLevel, setCrampsLevel] = useState<number>(0);

  const symptomList = [
    'Headache', 'Fatigue', 'Cramps', 'Bloating', 'Nausea',
    'Dizziness', 'Muscle pain', 'Back pain', 'Sore throat', 'Insomnia'
  ];

  useEffect(() => {
    if (isOpen && logDate) {
      api.getDailyLog(logDate).then((res) => {
        if (res.log) {
          const l = res.log;
          if (l.vital) {
            setRestingHr(l.vital.resting_hr ?? '');
            setBpSystolic(l.vital.bp_systolic ?? '');
            setBpDiastolic(l.vital.bp_diastolic ?? '');
            setSpo2(l.vital.spo2 ?? '');
            setTemperature(l.vital.temperature_c ?? '');
            setWeight(l.vital.weight_kg ?? '');
          }
          if (l.sleep) {
            setHoursSlept(l.sleep.hours_slept);
            setSleepQuality(l.sleep.quality_score);
            setBedtime(l.sleep.bedtime || '23:00');
            setWakeTime(l.sleep.wake_time || '07:00');
            setAwakenings(l.sleep.awakenings || 0);
          }
          if (l.wellness) {
            setEnergyScore(l.wellness.energy_score);
            setMoodScore(l.wellness.mood_score);
            setStressScore(l.wellness.stress_score);
            setFatigueScore(l.wellness.fatigue_score);
          }
          if (l.activity) {
            setSteps(l.activity.steps);
            setExerciseMins(l.activity.exercise_mins);
            setExerciseType(l.activity.exercise_type || '');
            setActivityLevel(l.activity.activity_level || 'Moderate');
          }
          if (l.lifestyle) {
            setWaterMl(l.lifestyle.water_ml);
            setCaffeineMg(l.lifestyle.caffeine_mg);
            setAlcoholUnits(l.lifestyle.alcohol_units);
            setNicotineUsed(l.lifestyle.nicotine_used);
            setNutritionNotes(l.lifestyle.nutrition_notes || '');
          }
          if (l.symptoms) {
            setSelectedSymptoms(l.symptoms.map(s => s.symptom_name));
          }
          if (l.cycle) {
            setIsPeriodDay(l.cycle.is_period_day);
            setFlowLevel(l.cycle.flow_level || 'Light');
            setCrampsLevel(l.cycle.cramps_level || 0);
          }
        }
      }).catch(() => {});
    }
  }, [isOpen, logDate]);

  if (!isOpen) return null;

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const validateInput = (): string | null => {
    if (restingHr !== '') {
      const rhr = Number(restingHr);
      if (isNaN(rhr) || rhr < 30 || rhr > 220) {
        return 'Resting heart rate must be a valid number between 30 and 220 bpm.';
      }
    }

    if (bpSystolic !== '') {
      const sys = Number(bpSystolic);
      if (isNaN(sys) || sys < 50 || sys > 260) {
        return 'Systolic blood pressure must be between 50 and 260 mmHg.';
      }
    }

    if (bpDiastolic !== '') {
      const dia = Number(bpDiastolic);
      if (isNaN(dia) || dia < 30 || dia > 180) {
        return 'Diastolic blood pressure must be between 30 and 180 mmHg.';
      }
    }

    if (hoursSlept < 0 || hoursSlept > 24) {
      return 'Sleep duration cannot be negative or exceed 24 hours.';
    }

    if (weight !== '') {
      const w = Number(weight);
      if (isNaN(w) || w <= 0 || w > 500) {
        return 'Weight must be a positive number up to 500 kg.';
      }
    }

    if (waterMl < 0 || waterMl > 10000) {
      return 'Water intake must be between 0 and 10,000 ml.';
    }

    if (steps < 0 || !Number.isInteger(steps)) {
      return 'Steps must be a non-negative integer.';
    }

    if (caffeineMg < 0) {
      return 'Caffeine intake cannot be negative.';
    }

    if (alcoholUnits < 0) {
      return 'Alcohol intake cannot be negative.';
    }

    return null;
  };

  const handleSave = async () => {
    setError(null);
    const validationErr = validateInput();
    if (validationErr) {
      setError(validationErr);
      return;
    }

    setLoading(true);

    const payload: Partial<DailyLog> = {
      log_date: logDate,
      vital: restingHr !== '' ? {
        resting_hr: Number(restingHr),
        bp_systolic: bpSystolic !== '' ? Number(bpSystolic) : undefined,
        bp_diastolic: bpDiastolic !== '' ? Number(bpDiastolic) : undefined,
        spo2: spo2 !== '' ? Number(spo2) : undefined,
        temperature_c: temperature !== '' ? Number(temperature) : undefined,
        weight_kg: weight !== '' ? Number(weight) : undefined
      } : undefined,
      sleep: {
        hours_slept: hoursSlept,
        quality_score: sleepQuality,
        bedtime,
        wake_time: wakeTime,
        awakenings
      },
      wellness: {
        energy_score: energyScore,
        mood_score: moodScore,
        stress_score: stressScore,
        fatigue_score: fatigueScore
      },
      activity: {
        steps,
        exercise_mins: exerciseMins,
        exercise_type: exerciseType,
        activity_level: activityLevel
      },
      lifestyle: {
        water_ml: waterMl,
        caffeine_mg: caffeineMg,
        alcohol_units: alcoholUnits,
        nicotine_used: nicotineUsed,
        nutrition_notes: nutritionNotes
      },
      symptoms: selectedSymptoms.map(s => ({ symptom_name: s, severity: 'Moderate', notes: symptomNotes })),
      cycle: profile?.cycle_tracking_enabled ? {
        is_period_day: isPeriodDay,
        flow_level: flowLevel,
        cramps_level: crampsLevel
      } : undefined
    };

    try {
      const res = await api.saveDailyLog(payload);
      onSaved(res.log);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save daily log entry.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'vitals', label: 'Vitals', icon: HeartPulse },
    { id: 'sleep', label: 'Sleep', icon: Moon },
    { id: 'wellness', label: 'Wellness', icon: Activity },
    { id: 'activity', label: 'Activity', icon: Flame },
    { id: 'lifestyle', label: 'Lifestyle', icon: Coffee },
    { id: 'symptoms', label: 'Symptoms', icon: AlertCircle },
    ...(profile?.cycle_tracking_enabled ? [{ id: 'cycle', label: 'Cycle', icon: Droplets }] : [])
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="glass-card w-full max-w-2xl p-5 sm:p-7 rounded-3xl relative shadow-glow border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-vital-600 to-emerald-400 flex items-center justify-center text-white font-extrabold text-xl shadow-glow">
              +
            </div>
            <div>
              <h2 className="font-black text-xl text-slate-900 dark:text-white">Daily Health Check-in</h2>
              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-vital-500" />
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="bg-transparent font-semibold text-vital-600 dark:text-vital-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="my-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-300 text-xs border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-3 border-b border-slate-200 dark:border-slate-800 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-vital-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Form Body */}
        <div className="flex-1 overflow-y-auto py-4 px-1 space-y-4">
          
          {/* VITALS TAB */}
          {activeTab === 'vitals' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 rounded-xl bg-vital-50/50 dark:bg-vital-950/40 text-xs text-vital-700 dark:text-vital-300 border border-vital-200/50 dark:border-vital-800/50">
                All fields are optional. Log what you have measured today.
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Resting Heart Rate (bpm)
                  </label>
                  <input
                    type="number"
                    value={restingHr}
                    onChange={(e) => setRestingHr(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 71"
                    className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 72.5"
                    className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    BP Systolic (mmHg)
                  </label>
                  <input
                    type="number"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 118"
                    className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    BP Diastolic (mmHg)
                  </label>
                  <input
                    type="number"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 76"
                    className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    SpO2 (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={spo2}
                    onChange={(e) => setSpo2(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 98"
                    className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Body Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 36.6"
                    className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SLEEP TAB */}
          {activeTab === 'sleep' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Hours Slept</span>
                  <span className="text-vital-600 font-bold text-sm">{hoursSlept} hrs</span>
                </div>
                <input
                  type="range" min="0" max="24" step="0.25" value={hoursSlept}
                  onChange={(e) => setHoursSlept(Number(e.target.value))}
                  className="w-full accent-vital-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Sleep Quality Score</span>
                  <span className="text-vital-600 font-bold text-sm">{sleepQuality}/10</span>
                </div>
                <input
                  type="range" min="1" max="10" value={sleepQuality}
                  onChange={(e) => setSleepQuality(Number(e.target.value))}
                  className="w-full accent-vital-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Bedtime</label>
                  <input
                    type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Wake Time</label>
                  <input
                    type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Awakenings</label>
                  <input
                    type="number" min="0" max="20" value={awakenings} onChange={(e) => setAwakenings(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* WELLNESS TAB */}
          {activeTab === 'wellness' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Energy Score</span>
                  <span className="text-emerald-600 font-bold text-sm">{energyScore}/10</span>
                </div>
                <input
                  type="range" min="1" max="10" value={energyScore}
                  onChange={(e) => setEnergyScore(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Mood Score</span>
                  <span className="text-vital-600 font-bold text-sm">{moodScore}/10</span>
                </div>
                <input
                  type="range" min="1" max="10" value={moodScore}
                  onChange={(e) => setMoodScore(Number(e.target.value))}
                  className="w-full accent-vital-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Stress Level</span>
                  <span className="text-amber-600 font-bold text-sm">{stressScore}/10</span>
                </div>
                <input
                  type="range" min="1" max="10" value={stressScore}
                  onChange={(e) => setStressScore(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Fatigue Score</span>
                  <span className="text-purple-600 font-bold text-sm">{fatigueScore}/10</span>
                </div>
                <input
                  type="range" min="1" max="10" value={fatigueScore}
                  onChange={(e) => setFatigueScore(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>
          )}

          {/* ACTIVITY TAB */}
          {activeTab === 'activity' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Daily Steps</label>
                  <input
                    type="number" min="0" value={steps} onChange={(e) => setSteps(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Exercise Mins</label>
                  <input
                    type="number" min="0" value={exerciseMins} onChange={(e) => setExerciseMins(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Exercise Activity</label>
                <input
                  type="text" value={exerciseType} onChange={(e) => setExerciseType(e.target.value)}
                  placeholder="e.g. Running, Yoga, Cycling"
                  className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* LIFESTYLE TAB */}
          {activeTab === 'lifestyle' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Water (ml)</label>
                  <input
                    type="number" min="0" step="100" value={waterMl} onChange={(e) => setWaterMl(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Caffeine (mg)</label>
                  <input
                    type="number" min="0" step="25" value={caffeineMg} onChange={(e) => setCaffeineMg(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Alcohol (units)</label>
                  <input
                    type="number" min="0" step="0.5" value={alcoholUnits} onChange={(e) => setAlcoholUnits(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <label className="flex items-center space-x-3 cursor-pointer pt-2">
                <input
                  type="checkbox" checked={nicotineUsed} onChange={(e) => setNicotineUsed(e.target.checked)}
                  className="w-4 h-4 text-vital-600 rounded focus:ring-vital-500"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Used nicotine / tobacco today</span>
              </label>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nutrition Notes</label>
                <textarea
                  rows={2} value={nutritionNotes} onChange={(e) => setNutritionNotes(e.target.value)}
                  placeholder="e.g. Balanced meals, hydrated well"
                  className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* SYMPTOMS TAB */}
          {activeTab === 'symptoms' && (
            <div className="space-y-4 animate-fade-in">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Select symptoms experienced today:
              </label>
              <div className="flex flex-wrap gap-2">
                {symptomList.map((sym) => {
                  const isSelected = selectedSymptoms.includes(sym);
                  return (
                    <button
                      key={sym} type="button" onClick={() => toggleSymptom(sym)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Symptom Notes</label>
                <input
                  type="text" value={symptomNotes} onChange={(e) => setSymptomNotes(e.target.value)}
                  placeholder="e.g. Mild headache after 3 PM"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* CYCLE TAB */}
          {activeTab === 'cycle' && profile?.cycle_tracking_enabled && (
            <div className="space-y-4 animate-fade-in">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox" checked={isPeriodDay} onChange={(e) => setIsPeriodDay(e.target.checked)}
                  className="w-4 h-4 text-vital-600 rounded focus:ring-vital-500"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Today is a period day</span>
              </label>

              {isPeriodDay && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Flow Level</label>
                    <select
                      value={flowLevel} onChange={(e) => setFlowLevel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white"
                    >
                      <option value="Spotting">Spotting</option>
                      <option value="Light">Light</option>
                      <option value="Medium">Medium</option>
                      <option value="Heavy">Heavy</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Cramps Severity</span>
                      <span className="text-rose-600 font-bold">{crampsLevel}/10</span>
                    </div>
                    <input
                      type="range" min="0" max="10" value={crampsLevel} onChange={(e) => setCrampsLevel(Number(e.target.value))}
                      className="w-full accent-rose-500"
                    />
                  </div>
                </>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            {activeTab !== 'symptoms' ? 'You can navigate tabs before saving.' : 'Click Save to record log.'}
          </div>

          <div className="flex space-x-2">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="button" disabled={loading} onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-vital-600 hover:bg-vital-500 text-white font-bold text-xs shadow-soft flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Daily Entry'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
