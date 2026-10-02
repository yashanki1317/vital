import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Check } from 'lucide-react';
import type { UserProfile } from '../types';
import { api } from '../services/api';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(30);
  const [sex, setSex] = useState<'male' | 'female' | 'non_binary' | 'prefer_not_to_say'>('prefer_not_to_say');
  const [heightCm, setHeightCm] = useState<number>(170);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [activityLevel, setActivityLevel] = useState<UserProfile['activity_level']>('moderately_active');

  // Optional State
  const [healthGoals, setHealthGoals] = useState<string[]>(['Improve sleep quality']);
  const [typicalSleepHrs, setTypicalSleepHrs] = useState<number | undefined>(7.5);
  const [typicalRhr, setTypicalRhr] = useState<number | undefined>(72);
  const [hasBpMonitor, setHasBpMonitor] = useState<boolean>(false);
  const [usesWearable, setUsesWearable] = useState<boolean>(false);
  const [cycleTrackingEnabled, setCycleTrackingEnabled] = useState<boolean>(false);

  if (!isOpen) return null;

  const goalOptions = [
    'Improve sleep quality',
    'Track resting heart rate',
    'Manage daily stress',
    'Boost energy levels',
    'Monitor blood pressure',
    'Maintain healthy weight',
    'Track workouts & activity'
  ];

  const toggleGoal = (goal: string) => {
    if (healthGoals.includes(goal)) {
      setHealthGoals(healthGoals.filter(g => g !== goal));
    } else {
      setHealthGoals([...healthGoals, goal]);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload: Partial<UserProfile> = {
      name: name.trim(),
      age,
      sex,
      height_cm: heightCm,
      weight_kg: weightKg,
      activity_level: activityLevel,
      health_goals: healthGoals,
      typical_sleep_hrs: typicalSleepHrs,
      typical_rhr: typicalRhr,
      has_bp_monitor: hasBpMonitor,
      uses_wearable: usesWearable,
      cycle_tracking_enabled: cycleTrackingEnabled
    };

    try {
      const res = await api.updateProfile(payload);
      onComplete(res.profile);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile setup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="glass-card w-full max-w-xl p-6 sm:p-8 rounded-3xl relative shadow-glow border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-vital-500 text-white flex items-center justify-center font-bold text-sm">
              {step}/2
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-slate-900 dark:text-white">
                {step === 1 ? 'Personal Profile Basics' : 'Preferences & Optional Baselines'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {step === 1 ? 'Required demographic info to tailor calculations.' : 'Help VITAL build your starting context.'}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Step 1: Required Basics */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Name <span className="text-vital-600">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-vital-500 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Age <span className="text-vital-600">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-vital-500 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sex <span className="text-vital-600">*</span>
                </label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-vital-500 dark:text-white"
                >
                  <option value="prefer_not_to_say">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non_binary">Non-binary</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Height (cm) <span className="text-vital-600">*</span>
                </label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-vital-500 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Weight (kg) <span className="text-vital-600">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-vital-500 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Typical Activity Level
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-vital-500 dark:text-white"
              >
                <option value="sedentary">Sedentary (Little or no exercise)</option>
                <option value="lightly_active">Lightly Active (1-3 days/week)</option>
                <option value="moderately_active">Moderately Active (3-5 days/week)</option>
                <option value="very_active">Very Active (6-7 days/week)</option>
                <option value="extra_active">Extra Active (Intense daily training)</option>
              </select>
            </div>

            <button
              onClick={() => {
                if (!name.trim()) {
                  setError('Please enter your name.');
                  return;
                }
                setError(null);
                setStep(2);
              }}
              className="w-full mt-4 py-3 rounded-xl bg-vital-600 hover:bg-vital-500 text-white font-bold text-sm shadow-soft flex items-center justify-center space-x-2"
            >
              <span>Continue to Step 2</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Optional Goals & Preferences */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                What are your main health goals? (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {goalOptions.map((goal) => {
                  const selected = healthGoals.includes(goal);
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleGoal(goal)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        selected
                          ? 'bg-vital-500 text-white border-vital-500 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {goal}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Typical Sleep (hours/night)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={typicalSleepHrs || ''}
                  onChange={(e) => setTypicalSleepHrs(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="7.5"
                  className="w-full px-4 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Typical Resting HR (bpm)
                </label>
                <input
                  type="number"
                  value={typicalRhr || ''}
                  onChange={(e) => setTypicalRhr(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="70"
                  className="w-full px-4 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={usesWearable}
                  onChange={(e) => setUsesWearable(e.target.checked)}
                  className="w-4 h-4 text-vital-600 rounded focus:ring-vital-500"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">I use a smartwatch or health wearable</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasBpMonitor}
                  onChange={(e) => setHasBpMonitor(e.target.checked)}
                  className="w-4 h-4 text-vital-600 rounded focus:ring-vital-500"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">I own a home blood pressure monitor</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={cycleTrackingEnabled}
                  onChange={(e) => setCycleTrackingEnabled(e.target.checked)}
                  className="w-4 h-4 text-vital-600 rounded focus:ring-vital-500"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Enable optional Menstrual / Cycle tracking module
                </span>
              </label>
            </div>

            <div className="flex space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
              >
                Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSaveProfile}
                className="flex-1 py-3 rounded-xl bg-vital-600 hover:bg-vital-500 text-white font-bold text-sm shadow-soft flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Saving Profile...' : 'Complete Setup & Go to Dashboard'}</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-vital-500 flex-shrink-0" />
          <span>Your data is stored securely and isolated to your account. VITAL does not sell or share personal health metrics.</span>
        </div>

      </div>
    </div>
  );
};
