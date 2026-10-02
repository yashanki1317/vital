export interface UserProfile {
  id?: number;
  user_id?: number;
  name: string;
  date_of_birth?: string;
  age?: number;
  sex: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
  height_cm?: number;
  weight_kg?: number;
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  health_goals: string[];
  typical_sleep_hrs?: number;
  typical_rhr?: number;
  has_bp_monitor?: boolean;
  uses_wearable?: boolean;
  cycle_tracking_enabled?: boolean;
  profile_picture_url?: string;
  emergency_contact?: string;
  notification_checkin_reminders?: boolean;
  notification_weekly_summaries?: boolean;
}

export interface User {
  id: number;
  email: string;
  created_at: string;
  profile?: UserProfile | null;
}

export interface VitalLog {
  id?: number;
  resting_hr?: number;
  bp_systolic?: number;
  bp_diastolic?: number;
  spo2?: number;
  temperature_c?: number;
  weight_kg?: number;
}

export interface SleepLog {
  id?: number;
  hours_slept: number;
  quality_score: number;
  bedtime?: string;
  wake_time?: string;
  awakenings?: number;
}

export interface WellnessLog {
  id?: number;
  energy_score: number;
  mood_score: number;
  stress_score: number;
  fatigue_score: number;
}

export interface ActivityLog {
  id?: number;
  steps: number;
  exercise_mins: number;
  exercise_type?: string;
  activity_level?: string;
}

export interface LifestyleLog {
  id?: number;
  water_ml: number;
  caffeine_mg: number;
  alcohol_units: number;
  nicotine_used: boolean;
  nutrition_notes?: string;
}

export interface SymptomLog {
  id?: number;
  symptom_name: string;
  severity: string;
  notes?: string;
}

export interface CycleLog {
  id?: number;
  is_period_day: boolean;
  flow_level?: string;
  cramps_level?: number;
  notes?: string;
}

export interface DailyLog {
  id?: number;
  user_id?: number;
  log_date: string;
  general_notes?: string;
  vital?: VitalLog | null;
  sleep?: SleepLog | null;
  wellness?: WellnessLog | null;
  activity?: ActivityLog | null;
  lifestyle?: LifestyleLog | null;
  symptoms?: SymptomLog[];
  cycle?: CycleLog | null;
  created_at?: string;
}

export interface BaselineMetricInfo {
  count: number;
  avg: number | null;
  stddev: number | null;
  min: number | null;
  max: number | null;
  range_low: number | null;
  range_high: number | null;
}

export interface Baselines {
  resting_hr?: BaselineMetricInfo;
  bp_systolic?: BaselineMetricInfo;
  bp_diastolic?: BaselineMetricInfo;
  hours_slept?: BaselineMetricInfo;
  sleep_quality?: BaselineMetricInfo;
  energy_score?: BaselineMetricInfo;
  mood_score?: BaselineMetricInfo;
  stress_score?: BaselineMetricInfo;
  steps?: BaselineMetricInfo;
  water_ml?: BaselineMetricInfo;
  weight_kg?: BaselineMetricInfo;
  _total_days_logged?: number;
  _sufficient_data?: boolean;
}

export interface NoticeAlert {
  id: string;
  severity: 'info' | 'notice' | 'warning';
  title: string;
  message: string;
  date: string;
}

export interface AIInsightItem {
  id: number;
  category: 'Sleep' | 'Energy' | 'Stress' | 'Vitals' | 'Lifestyle' | 'General';
  title: string;
  content: string;
  observation_type: 'Pattern' | 'Baseline Shift' | 'Correlation' | 'Summary';
  created_at: string;
  is_read?: boolean;
}

export interface AIChatMessageItem {
  id: number;
  conversation_id?: number;
  role: 'user' | 'assistant';
  content?: string;
  message: string;
  created_at: string;
}

export interface ChatConversationItem {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  last_message?: AIChatMessageItem | null;
}

export interface TrendSeriesPoint {
  date: string;
  resting_hr?: number | null;
  bp_systolic?: number | null;
  bp_diastolic?: number | null;
  weight_kg?: number | null;
  hours_slept?: number | null;
  sleep_quality?: number | null;
  energy_score?: number | null;
  mood_score?: number | null;
  stress_score?: number | null;
  steps?: number | null;
  water_ml?: number | null;
}
