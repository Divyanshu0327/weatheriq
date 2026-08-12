import React, { useState, useEffect } from 'react';
import { alertService } from '../../services/alertService';
import { subscriptionService } from '../../services/subscriptionService';
import { weatherService } from '../../services/weatherService';
import { useAuth } from '../../context/AuthContext';
import { Bell, Plus, Trash2, ShieldAlert, CheckCircle2, Search, Send } from 'lucide-react';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import Toast from '../../components/common/Toast';

const AlertsPage = () => {
  const { isAuthenticated } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Manual Trigger State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sendingAlerts, setSendingAlerts] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState('EXTREME_HEAT');
  const [threshold, setThreshold] = useState(35);
  const [city, setCity] = useState('Delhi');
  const [latitude, setLatitude] = useState(28.6139);
  const [longitude, setLongitude] = useState(77.2090);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await alertService.getAlerts();
      if (res.success && res.data) {
        setAlerts(res.data);
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to fetch alert rules', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleSendWeatherAlertsNow = async () => {
    setSendingAlerts(true);
    try {
      const res = await subscriptionService.sendWeatherAlertsNow();
      setShowConfirmModal(false);
      if (res.success) {
        const stats = res.data;
        if (!stats || stats.processed === 0) {
          setToast({ message: res.message || 'No active weather subscriptions found', type: 'info' });
        } else if (stats.sent > 0) {
          setToast({
            message: `Weather alert email sent successfully! (Sent: ${stats.sent}, Skipped: ${stats.skipped}, Failed: ${stats.failed})`,
            type: 'success',
          });
        } else {
          setToast({ message: res.message || 'Weather alert request processed', type: 'info' });
        }
        fetchAlerts();
      }
    } catch (err) {
      setShowConfirmModal(false);
      setToast({
        message: err.message || 'Unable to send email right now. Please try again later.',
        type: 'error',
      });
    } finally {
      setSendingAlerts(false);
    }
  };

  const handleSearchCity = async (query) => {
    setSearchQuery(query);
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await weatherService.searchLocations(query);
      if (res.success) setSearchResults(res.data);
    } catch (err) {
      setSearchResults([]);
    }
  };

  const handleSelectCity = (r) => {
    setCity(r.name);
    setLatitude(r.latitude);
    setLongitude(r.longitude);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        type,
        threshold: Number(threshold),
        enabled: true,
        city,
        latitude,
        longitude,
      };
      const res = await alertService.createAlert(payload);
      if (res.success) {
        setToast({ message: `Created ${type} alert rule for ${city}!`, type: 'success' });
        setShowModal(false);
        fetchAlerts();
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to create alert rule', type: 'error' });
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      const res = await alertService.deleteAlert(id);
      if (res.success) {
        setToast({ message: 'Alert rule removed', type: 'success' });
        fetchAlerts();
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to delete alert rule', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
            Smart Weather Alert Rules
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Automated condition-based email notifications when thresholds are crossed</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={sendingAlerts}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition shadow-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {sendingAlerts ? 'Sending...' : '📧 Send My Weather Alert Now'}
            </button>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Alert Rule
          </button>
        </div>
      </div>

      {loading && <LoadingSkeleton type="card" count={2} />}

      {!loading && alerts.length === 0 && (
        <EmptyState
          title="No Weather Alert Rules Configured"
          message="Set up smart condition-based alerts for extreme heat, heavy rain, poor AQI, or strong winds."
          actionLabel="Create Alert Rule"
          onAction={() => setShowModal(true)}
          icon={Bell}
        />
      )}

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alerts.map((alert) => (
          <div key={alert.id} className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm card-hover flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-extrabold uppercase">
                  <ShieldAlert className="w-3.5 h-3.5" /> {alert.type.replace('_', ' ')}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" /> Enabled
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 font-heading">{alert.city}</h3>
              <p className="text-xs text-slate-600 font-semibold mt-2">
                Trigger Threshold: <strong className="text-blue-600 text-sm font-bold">{alert.threshold}</strong>
              </p>
            </div>

            <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100 text-xs">
              <span className="text-slate-400">
                Last Triggered: {alert.lastTriggeredAt ? new Date(alert.lastTriggeredAt).toLocaleString() : 'Never'}
              </span>
              <button
                onClick={() => handleDeleteAlert(alert.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                title="Delete Alert Rule"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-heading">Send Weather Alert Now</h3>
            <p className="text-sm text-slate-600">
              Send your current weather alert email now? This will immediately process your active weather subscriptions.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={sendingAlerts}
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sendingAlerts}
                onClick={handleSendWeatherAlertsNow}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm disabled:opacity-50"
              >
                {sendingAlerts ? 'Sending...' : 'Send Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Alert Rule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-heading">New Alert Rule</h3>

            <form onSubmit={handleCreateAlert} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Target City</label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery || city}
                    onChange={(e) => handleSearchCity(e.target.value)}
                    placeholder="Search city..."
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-xl p-1 mt-1 bg-white shadow-lg">
                    {searchResults.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleSelectCity(r)}
                        className="w-full p-2 text-left text-xs font-medium hover:bg-slate-50 text-slate-800"
                      >
                        {r.name}, {r.country}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Alert Condition Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
                >
                  <option value="EXTREME_HEAT">EXTREME HEAT (°C)</option>
                  <option value="EXTREME_COLD">EXTREME COLD (°C)</option>
                  <option value="RAIN">RAIN DETECTED</option>
                  <option value="HIGH_AQI">HIGH AQI THRESHOLD</option>
                  <option value="HIGH_UV">HIGH UV INDEX</option>
                  <option value="STRONG_WIND">STRONG WIND SPEED (km/h)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Numerical Threshold</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs shadow-sm hover:bg-blue-700"
                >
                  Save Alert Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AlertsPage;
