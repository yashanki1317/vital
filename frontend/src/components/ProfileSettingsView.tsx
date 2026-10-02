import React, { useState, useRef } from 'react';
import { User, Download, Check, Camera, Trash2, KeyRound, AlertTriangle, Bell, Lock } from 'lucide-react';
import type { UserProfile } from '../types';
import { api, UPLOADS_BASE_URL } from '../services/api';

interface ProfileSettingsViewProps {
  profile: UserProfile | null;
  onUpdateProfile: (p: UserProfile) => void;
  onLogout: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  profile,
  onUpdateProfile,
  onLogout
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Demographics state
  const [name, setName] = useState(profile?.name || '');
  const [dateOfBirth, setDateOfBirth] = useState(profile?.date_of_birth || '');
  const [age, setAge] = useState<number | ''>(profile?.age ?? '');
  const [sex, setSex] = useState<'male' | 'female' | 'non_binary' | 'prefer_not_to_say'>(profile?.sex || 'prefer_not_to_say');
  const [heightCm, setHeightCm] = useState<number | ''>(profile?.height_cm ?? '');
  const [weightKg, setWeightKg] = useState<number | ''>(profile?.weight_kg ?? '');
  const [activityLevel, setActivityLevel] = useState(profile?.activity_level || 'moderately_active');
  const [emergencyContact, setEmergencyContact] = useState(profile?.emergency_contact || '');
  const [cycleTrackingEnabled, setCycleTrackingEnabled] = useState(profile?.cycle_tracking_enabled || false);

  // Notifications state
  const [checkinReminders, setCheckinReminders] = useState(profile?.notification_checkin_reminders ?? true);
  const [weeklySummaries, setWeeklySummaries] = useState(profile?.notification_weekly_summaries ?? true);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // UI state
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Avatar Image URL helper
  const avatarUrl = profile?.profile_picture_url
    ? (profile.profile_picture_url.startsWith('http') ? profile.profile_picture_url : `${UPLOADS_BASE_URL}${profile.profile_picture_url}`)
    : null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await api.updateProfile({
        name,
        date_of_birth: dateOfBirth,
        age: age === '' ? undefined : Number(age),
        sex,
        height_cm: heightCm === '' ? undefined : Number(heightCm),
        weight_kg: weightKg === '' ? undefined : Number(weightKg),
        activity_level: activityLevel,
        emergency_contact: emergencyContact,
        cycle_tracking_enabled: cycleTrackingEnabled,
        notification_checkin_reminders: checkinReminders,
        notification_weekly_summaries: weeklySummaries,
      });
      onUpdateProfile(res.profile);
      setFeedback({ type: 'success', text: 'Profile preferences updated successfully.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: 'error', text: 'Image file size must be less than 5 MB.' });
      return;
    }

    setUploadingAvatar(true);
    setFeedback(null);

    try {
      const res = await api.uploadAvatar(file);
      onUpdateProfile(res.profile);
      setFeedback({ type: 'success', text: 'Profile picture uploaded successfully.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Avatar upload failed.' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setUploadingAvatar(true);
    setFeedback(null);
    try {
      const res = await api.deleteAvatar();
      onUpdateProfile(res.profile);
      setFeedback({ type: 'success', text: 'Profile picture removed.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to remove avatar.' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setFeedback({ type: 'error', text: 'Please fill in both current and new password.' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setFeedback({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setFeedback({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    setChangingPassword(true);
    setFeedback(null);
    try {
      await api.changePassword(currentPassword, newPassword);
      setFeedback({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    try {
      const logs = await api.getDailyLogs();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs.logs, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `vital_health_export_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Could not export health data.');
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await api.deleteAccount();
      onLogout();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to delete account.' });
      setShowDeleteModal(false);
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
          <User className="w-6 h-6 text-vital-500" />
          <span>User Profile & Settings</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal details, profile picture, account security, and notification preferences.
        </p>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between ${
          feedback.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
        }`}>
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-xs underline opacity-80 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* Profile Picture Card */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-tr from-vital-600 to-emerald-400 flex items-center justify-center text-white text-3xl font-extrabold shadow-md border-4 border-white dark:border-slate-900">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span>{(name || 'U').charAt(0).toUpperCase()}</span>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute bottom-0 right-0 p-2 rounded-full bg-vital-600 hover:bg-vital-500 text-white shadow-lg transition-transform hover:scale-105"
            title="Upload profile picture"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">{name || 'Your Profile'}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Upload your custom image file. Supported: PNG, JPG, WEBP (Max 5 MB).
          </p>

          <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="px-4 py-2 rounded-xl bg-vital-600 hover:bg-vital-500 text-white font-bold text-xs shadow-soft transition-all"
            >
              {uploadingAvatar ? 'Uploading...' : 'Upload New Picture'}
            </button>
            {avatarUrl && (
              <button
                onClick={handleDeleteAvatar}
                disabled={uploadingAvatar}
                className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 hover:bg-red-100 font-semibold text-xs border border-red-200 dark:border-red-800 transition-all flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Demographics Form */}
      <form onSubmit={handleSaveProfile} className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-5">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800">
          Demographic Information
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white focus:ring-2 focus:ring-vital-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white focus:ring-2 focus:ring-vital-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
              placeholder="e.g. 30"
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white focus:ring-2 focus:ring-vital-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender / Sex</label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white focus:ring-2 focus:ring-vital-500"
            >
              <option value="prefer_not_to_say">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non_binary">Non-binary</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Height (cm)</label>
            <input
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value ? Number(e.target.value) : '')}
              placeholder="170"
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white focus:ring-2 focus:ring-vital-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value ? Number(e.target.value) : '')}
              placeholder="70.5"
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white focus:ring-2 focus:ring-vital-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Activity Level</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white focus:ring-2 focus:ring-vital-500"
            >
              <option value="sedentary">Sedentary</option>
              <option value="lightly_active">Lightly Active</option>
              <option value="moderately_active">Moderately Active</option>
              <option value="very_active">Very Active</option>
              <option value="extra_active">Extra Active</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Emergency Contact (Optional)</label>
            <input
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="Name & Phone Number"
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white focus:ring-2 focus:ring-vital-500"
            />
          </div>
        </div>

        {/* Optional Module Toggle */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={cycleTrackingEnabled}
              onChange={(e) => setCycleTrackingEnabled(e.target.checked)}
              className="w-4 h-4 text-vital-600 rounded focus:ring-vital-500"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
              Enable Optional Menstrual / Cycle Tracking Module
            </span>
          </label>
        </div>

        {/* Notifications */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2 mb-2">
            <Bell className="w-4 h-4 text-vital-500" />
            <span>Notification Reminders</span>
          </h4>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checkinReminders}
              onChange={(e) => setCheckinReminders(e.target.checked)}
              className="w-4 h-4 text-vital-600 rounded focus:ring-vital-500"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300">Daily check-in reminders</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={weeklySummaries}
              onChange={(e) => setWeeklySummaries(e.target.checked)}
              className="w-4 h-4 text-vital-600 rounded focus:ring-vital-500"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300">Weekly baseline summary digests</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-vital-600 hover:bg-vital-500 text-white font-bold text-xs shadow-soft flex items-center space-x-2"
        >
          <Check className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
        </button>
      </form>

      {/* Password Management */}
      <form onSubmit={handleChangePassword} className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <Lock className="w-4 h-4 text-vital-500" />
          <span>Security & Password</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={changingPassword}
          className="px-5 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-bold text-xs hover:bg-slate-700 flex items-center space-x-2"
        >
          <KeyRound className="w-4 h-4" />
          <span>{changingPassword ? 'Updating...' : 'Update Password'}</span>
        </button>
      </form>

      {/* Export & Data Management */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Data Export & Portability</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Download a complete JSON backup of all your logged health entries.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 font-semibold text-xs flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Health Data (JSON)</span>
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 font-semibold text-xs"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Danger Zone: Permanent Account Deletion */}
      <div className="glass-card p-6 rounded-3xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 space-y-3">
        <h3 className="font-extrabold text-base text-red-600 dark:text-red-400 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5" />
          <span>Danger Zone: Permanent Account Deletion</span>
        </h3>
        <p className="text-xs text-red-700 dark:text-red-300/90 leading-relaxed">
          Permanently delete your VITAL account and all associated health entries, vitals, sleep logs, wellness scores, chat conversations, and uploaded profile media. This action cannot be undone.
        </p>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-soft flex items-center space-x-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Account Permanently</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 rounded-3xl border border-red-300 dark:border-red-800 bg-white dark:bg-slate-900 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Confirm Account Deletion</h3>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete your VITAL account? All historical daily logs, vitals, sleep records, wellness entries, chat history, and uploaded images will be purged permanently from the database.
            </p>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-soft"
              >
                {deletingAccount ? 'Deleting...' : 'Yes, Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
