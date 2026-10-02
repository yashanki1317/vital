import React from 'react';
import { ShieldCheck, Lock, Eye } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
          <ShieldCheck className="w-6 h-6 text-vital-500" />
          <span>Privacy & Non-Diagnostic Disclosure</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          How VITAL handles your personal health metrics, data isolation, and safety boundaries.
        </p>
      </div>

      <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Lock className="w-4 h-4 text-vital-500" />
          <span>1. Platform Purpose & Medical Disclaimer</span>
        </h3>
        <p>
          VITAL is a personalized health, wellness, and self-logged data tracking platform designed for individuals of all genders and ages. VITAL is intended purely for self-observation, trend tracking, and personal wellness awareness.
        </p>
        <p className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-medium">
          IMPORTANT: VITAL is NOT a medical diagnostic tool, treatment provider, or clinical monitoring device. VITAL does not detect diseases, predict acute medical events, or offer clinical medical advice. Always consult a qualified healthcare professional regarding any medical concerns or persistent symptoms.
        </p>

        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2 pt-2">
          <ShieldCheck className="w-4 h-4 text-vital-500" />
          <span>2. Strict Data Security & Isolation</span>
        </h3>
        <p>
          Your health data belongs exclusively to you. All logged entries, personal baselines, and chat histories are isolated strictly to your account using secure database queries with foreign key constraints.
        </p>
        <ul className="space-y-1 pl-4 list-disc text-slate-600 dark:text-slate-400">
          <li>Passwords are securely hashed using industry-standard bcrypt / Werkzeug hashing.</li>
          <li>All API endpoints require valid JWT authentication tokens.</li>
          <li>AI integrations pass only sanitized statistical summaries to Claude without exposing raw database tables.</li>
        </ul>

        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2 pt-2">
          <Eye className="w-4 h-4 text-vital-500" />
          <span>3. Universal & Inclusive Design</span>
        </h3>
        <p>
          VITAL is designed for everyone. Optional modules such as cycle tracking can be turned on or off in settings at any time without restricting or altering the core application experience.
        </p>
      </div>
    </div>
  );
};
