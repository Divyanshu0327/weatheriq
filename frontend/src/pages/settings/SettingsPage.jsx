import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWeather } from '../../context/WeatherContext';
import { userService } from '../../services/userService';
import { User, Settings as SettingsIcon, Thermometer, Bell, Mail, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';
import Toast from '../../components/common/Toast';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const { temperatureUnit, setTemperatureUnit } = useWeather();

  const [name, setName] = useState(user?.name || '');
  const [defaultCity, setDefaultCity] = useState(user?.defaultCity || 'Delhi');
  const [unit, setUnit] = useState(user?.temperatureUnit || temperatureUnit);
  const [notificationEnabled, setNotificationEnabled] = useState(user?.notificationEnabled ?? true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(user?.emailNotificationsEnabled ?? true);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setDefaultCity(user.defaultCity || 'Delhi');
      setUnit(user.temperatureUnit || 'CELSIUS');
      setNotificationEnabled(user.notificationEnabled ?? true);
      setEmailNotificationsEnabled(user.emailNotificationsEnabled ?? true);
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await userService.updateProfile({ name });
      if (res.success && res.data) {
        updateUser(res.data);
        setToast({ message: 'Profile updated successfully!', type: 'success' });
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to update profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      const res = await userService.updatePreferences({
        defaultCity,
        temperatureUnit: unit,
        notificationEnabled,
        emailNotificationsEnabled,
      });
      if (res.success && res.data) {
        updateUser(res.data);
        setTemperatureUnit(unit);
        setToast({ message: 'Preferences saved successfully!', type: 'success' });
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to save preferences', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
          Profile & User Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage your profile details, default city, and notification preferences</p>
      </div>

      {/* User Information Card */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white font-extrabold text-2xl font-heading shadow-md">
            {name ? name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 font-heading">{name || 'User'}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                user?.emailVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                <CheckCircle2 className="w-3 h-3" /> {user?.emailVerified ? 'VERIFIED' : 'UNVERIFIED'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700">
                <ShieldCheck className="w-3 h-3" /> {user?.roles?.join(', ') || 'ROLE_USER'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Account Details</h4>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full max-w-md px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition disabled:opacity-50"
          >
            Update Profile Name
          </button>
        </form>
      </div>

      {/* Preferences Section */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-6">
        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Dashboard & Notification Preferences</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Temperature Unit */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Temperature Display Unit</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setUnit('CELSIUS')}
                className={`flex-1 p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                  unit === 'CELSIUS' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Thermometer className="w-4 h-4" /> Celsius (°C)
              </button>
              <button
                type="button"
                onClick={() => setUnit('FAHRENHEIT')}
                className={`flex-1 p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                  unit === 'FAHRENHEIT' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Thermometer className="w-4 h-4" /> Fahrenheit (°F)
              </button>
            </div>
          </div>

          {/* Default City */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Default Home City</label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={defaultCity}
                onChange={(e) => setDefaultCity(e.target.value)}
                placeholder="e.g. Delhi"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-bold text-slate-800">Smart Alert Push Notifications</p>
                <p className="text-xs text-slate-500">Allow instant condition alerts when extreme weather occurs</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notificationEnabled}
              onChange={(e) => setNotificationEnabled(e.target.checked)}
              className="w-5 h-5 accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-bold text-slate-800">Email Digest Notifications</p>
                <p className="text-xs text-slate-500">Allow scheduled city weather emails</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={emailNotificationsEnabled}
              onChange={(e) => setEmailNotificationsEnabled(e.target.checked)}
              className="w-5 h-5 accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSavePreferences}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50"
        >
          Save All Preferences
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default SettingsPage;
