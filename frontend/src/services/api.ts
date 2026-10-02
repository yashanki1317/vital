import type {
  User, UserProfile, DailyLog, Baselines, NoticeAlert, AIInsightItem,
  AIChatMessageItem, ChatConversationItem, TrendSeriesPoint
} from '../types';

const getRawApiUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return 'https://vital-bxus.onrender.com';
};

const rawBaseUrl = getRawApiUrl();

export const API_BASE_URL = rawBaseUrl.endsWith('/api')
  ? rawBaseUrl
  : `${rawBaseUrl}/api`;

export const UPLOADS_BASE_URL = rawBaseUrl.endsWith('/api')
  ? rawBaseUrl.slice(0, -4)
  : rawBaseUrl;


class ApiService {
  private token: string | null = null;
  private isDemoMode: boolean = false;

  constructor() {
    this.token = localStorage.getItem('vital_token');
    this.isDemoMode = localStorage.getItem('vital_demo_mode') === 'true';
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('vital_token', token);
    } else {
      localStorage.removeItem('vital_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  setDemoMode(isDemo: boolean) {
    this.isDemoMode = isDemo;
    localStorage.setItem('vital_demo_mode', isDemo ? 'true' : 'false');
  }

  getDemoMode(): boolean {
    return this.isDemoMode;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const isFormData = options.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        if (this.token && !this.isDemoMode) {
          this.setToken(null);
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data as T;
    } catch (err: any) {
      throw err;
    }
  }

  // Auth APIs
  async register(email: string, password: string, fullName?: string): Promise<{ access_token: string; user: User }> {
    const data = await this.request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    this.setToken(data.access_token);
    this.setDemoMode(false);
    return data;
  }

  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const data = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    this.setDemoMode(false);
    return data;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(email: string, newPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, new_password: newPassword }),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  }

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  async deleteAccount(): Promise<{ message: string }> {
    const res = await this.request<{ message: string }>('/profile/account', {
      method: 'DELETE',
    });
    this.setToken(null);
    return res;
  }

  // Profile API
  async getProfile(): Promise<{ profile: UserProfile | null; onboarding_completed: boolean }> {
    return this.request('/profile');
  }

  async updateProfile(profile: Partial<UserProfile>): Promise<{ profile: UserProfile }> {
    return this.request('/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  async uploadAvatar(file: File): Promise<{ profile: UserProfile; profile_picture_url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.request('/profile/avatar', {
      method: 'POST',
      body: formData,
    });
  }

  async deleteAvatar(): Promise<{ profile: UserProfile }> {
    return this.request('/profile/avatar', {
      method: 'DELETE',
    });
  }

  // Daily Log API
  async saveDailyLog(log: Partial<DailyLog>): Promise<{ log: DailyLog }> {
    return this.request('/daily-log', {
      method: 'POST',
      body: JSON.stringify(log),
    });
  }

  async getDailyLog(dateStr: string): Promise<{ log: DailyLog | null }> {
    return this.request(`/daily-log/${dateStr}`);
  }

  async getDailyLogs(): Promise<{ logs: DailyLog[] }> {
    return this.request('/daily-logs');
  }

  async deleteDailyLog(dateStr: string): Promise<{ message: string }> {
    return this.request(`/daily-log/${dateStr}`, {
      method: 'DELETE',
    });
  }

  // Dashboard API
  async getDashboardData(): Promise<{
    profile: UserProfile | null;
    today_logged: boolean;
    snapshot_date: string | null;
    snapshot: any;
    baselines: Baselines;
    alerts: NoticeAlert[];
    recent_insights: AIInsightItem[];
    total_days_logged: number;
    sufficient_data: boolean;
    empty_state_message: string | null;
  }> {
    if (this.isDemoMode) {
      const demoData = await this.getDemoData();
      return {
        profile: demoData.profile as any,
        today_logged: true,
        snapshot_date: demoData.logs[demoData.logs.length - 1].log_date,
        snapshot: {
          resting_hr: { value: 71, unit: 'bpm', comparison: 'Within your usual personal range (68 - 74 bpm).', status: 'normal' },
          sleep: { value: 7.8, formatted: '7h 48m', comparison: 'Higher than your recent personal baseline (7.2h).', status: 'higher' },
          wellness: { energy: 8, mood: 8, stress: 3, fatigue: 2 },
          activity: { steps: 9420, exercise_mins: 45, exercise_type: 'Running' },
          hydration: { water_ml: 2400 },
          blood_pressure: { systolic: 118, diastolic: 76, formatted: '118/76 mmHg' }
        },
        baselines: demoData.baselines,
        alerts: demoData.alerts,
        recent_insights: demoData.insights,
        total_days_logged: 30,
        sufficient_data: true,
        empty_state_message: null
      };
    }
    return this.request('/dashboard');
  }

  // Trends API
  async getTrends(range: '7d' | '30d' | '90d' | '1y'): Promise<{
    range: string;
    days: number;
    chart_series: TrendSeriesPoint[];
    written_summaries: string[];
  }> {
    if (this.isDemoMode) {
      const demoData = await this.getDemoData();
      const series: TrendSeriesPoint[] = demoData.logs.map((l: any) => ({
        date: l.log_date,
        resting_hr: l.vital?.resting_hr,
        bp_systolic: l.vital?.bp_systolic,
        bp_diastolic: l.vital?.bp_diastolic,
        weight_kg: l.vital?.weight_kg,
        hours_slept: l.sleep?.hours_slept,
        sleep_quality: l.sleep?.quality_score,
        energy_score: l.wellness?.energy_score,
        mood_score: l.wellness?.mood_score,
        stress_score: l.wellness?.stress_score,
        steps: l.activity?.steps,
        water_ml: l.lifestyle?.water_ml
      }));
      return {
        range,
        days: 30,
        chart_series: series,
        written_summaries: [
          'Sample Data: Average sleep duration is 7h 25m.',
          'Sample Data: Resting heart rate stable.'
        ]
      };
    }
    return this.request(`/trends?range=${range}`);
  }

  // Insights API
  async getInsights(): Promise<{ insights: AIInsightItem[] }> {
    if (this.isDemoMode) {
      const demo = await this.getDemoData();
      return { insights: demo.insights };
    }
    return this.request('/insights');
  }

  async generateInsights(): Promise<{ insights: AIInsightItem[] }> {
    if (this.isDemoMode) {
      const demo = await this.getDemoData();
      return { insights: demo.insights };
    }
    return this.request('/insights/generate', { method: 'POST' });
  }

  // Chat APIs (Full conversation support)
  async getConversations(): Promise<{ conversations: ChatConversationItem[] }> {
    if (this.isDemoMode) return { conversations: [] };
    return this.request('/chat/conversations');
  }

  async createConversation(title?: string): Promise<{ conversation: ChatConversationItem }> {
    if (this.isDemoMode) {
      return { conversation: { id: Date.now(), title: title || 'Demo Conversation', created_at: new Date().toISOString(), updated_at: new Date().toISOString() } };
    }
    return this.request('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  }

  async getConversationMessages(id: number): Promise<{ conversation: ChatConversationItem; messages: AIChatMessageItem[] }> {
    if (this.isDemoMode) {
      return {
        conversation: { id, title: 'Demo Conversation', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        messages: []
      };
    }
    return this.request(`/chat/conversations/${id}`);
  }

  async renameConversation(id: number, title: string): Promise<{ conversation: ChatConversationItem }> {
    if (this.isDemoMode) {
      return { conversation: { id, title, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } };
    }
    return this.request(`/chat/conversations/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    });
  }

  async deleteConversation(id: number): Promise<{ message: string }> {
    if (this.isDemoMode) return { message: 'Deleted demo conversation' };
    return this.request(`/chat/conversations/${id}`, {
      method: 'DELETE',
    });
  }

  async sendChatMessage(message: string, conversationId?: number): Promise<{ reply: AIChatMessageItem; conversation: ChatConversationItem }> {
    if (this.isDemoMode) {
      const msgLower = message.toLowerCase();
      let replyText = "Demo AI: In this synthetic 30-day dataset, your sleep averaged 7.4 hours and resting heart rate averaged 71 bpm. Active days correlated with an average +1.5 boost in reported mood score.";
      if (msgLower.includes('sleep') || msgLower.includes('energy')) {
        replyText = "Demo AI: Analysis of your sample data shows that nights with 7.5+ hours of sleep were followed by 1.8 points higher energy ratings on average.";
      }
      return {
        reply: {
          id: Date.now(),
          conversation_id: conversationId || 101,
          role: 'assistant',
          message: replyText,
          content: replyText,
          created_at: new Date().toISOString()
        },
        conversation: {
          id: conversationId || 101,
          title: message.substring(0, 30),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
    }
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversation_id: conversationId }),
    });
  }

  async getChatHistory(): Promise<{ messages: AIChatMessageItem[] }> {
    if (this.isDemoMode) {
      return { messages: [] };
    }
    return this.request('/insights/chat/history');
  }

  // Timeline API
  async getTimeline(): Promise<{ timeline: DailyLog[] }> {
    if (this.isDemoMode) {
      const demo = await this.getDemoData();
      return { timeline: demo.logs };
    }
    return this.request('/timeline');
  }

  // Demo API (Only for dev explore mode, completely separated)
  async getDemoData(): Promise<any> {
    try {
      const data = await fetch(`${API_BASE_URL}/demo/data`).then(r => r.json());
      return data;
    } catch (e) {
      return this.getFallbackClientDemoData();
    }
  }

  private getFallbackClientDemoData() {
    return {
      profile: {
        name: 'Alex Morgan (Demo)',
        age: 32,
        sex: 'non_binary',
        height_cm: 175,
        weight_kg: 72.5,
        activity_level: 'moderately_active',
        health_goals: ['Improve sleep quality', 'Lower stress levels', 'Track resting heart rate'],
        has_bp_monitor: true,
        uses_wearable: true,
        cycle_tracking_enabled: false
      },
      logs: Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        const dateStr = d.toISOString().split('T')[0];
        return {
          id: 2000 + i,
          log_date: dateStr,
          vital: { resting_hr: 70 + (i % 5), bp_systolic: 118 + (i % 4), bp_diastolic: 76 + (i % 3), weight_kg: 72.5 },
          sleep: { hours_slept: 7.0 + (i % 3) * 0.4, quality_score: 7 + (i % 3), bedtime: '23:15', wake_time: '07:15' },
          wellness: { energy_score: 7 + (i % 3), mood_score: 8, stress_score: 3 + (i % 4), fatigue_score: 3 },
          activity: { steps: 8000 + (i % 7) * 500, exercise_mins: 30, exercise_type: 'Brisk Walk' },
          lifestyle: { water_ml: 2200, caffeine_mg: 150, alcohol_units: 0, nicotine_used: false },
          symptoms: []
        };
      }),
      baselines: {
        resting_hr: { avg: 72, range_low: 68, range_high: 76 },
        hours_slept: { avg: 7.4, range_low: 6.8, range_high: 8.0 },
        energy_score: { avg: 7.5, range_low: 6.5, range_high: 8.5 },
        stress_score: { avg: 4.0, range_low: 3.0, range_high: 5.5 }
      },
      alerts: [],
      insights: []
    };
  }
}

export const api = new ApiService();
