import React, { useState, useEffect } from 'react';
import { subscriptionService } from '../../services/subscriptionService';
import { weatherService } from '../../services/weatherService';
import { useAuth } from '../../context/AuthContext';
import { Mail, Plus, Trash2, Clock, CheckCircle2, Search, Send } from 'lucide-react';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import Toast from '../../components/common/Toast';

const SubscriptionsPage = () => {
  const { isAuthenticated } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Manual Trigger & Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sendingAlerts, setSendingAlerts] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [city, setCity] = useState('');
  const [latitude, setLatitude] = useState(28.6139);
  const [longitude, setLongitude] = useState(77.2090);
  const [frequency, setFrequency] = useState('HOURLY');
  const [selectedMetrics, setSelectedMetrics] = useState(['TEMPERATURE', 'RAIN_PROBABILITY', 'AQI', 'WEATHER_INTELLIGENCE']);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await subscriptionService.getSubscriptions();
      if (res.success && res.data) {
        setSubscriptions(res.data);
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to fetch subscriptions', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
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
        fetchSubscriptions();
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

  const handleCreateSubscription = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        city,
        latitude,
        longitude,
        frequency,
        enabled: true,
        selectedMetrics,
      };
      const res = await subscriptionService.createSubscription(payload);
      if (res.success) {
        setToast({ message: `Created subscription for ${city}!`, type: 'success' });
        setShowModal(false);
        fetchSubscriptions();
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to create subscription', type: 'error' });
    }
  };

  const handleDeleteSubscription = async (id) => {
    try {
      const res = await subscriptionService.deleteSubscription(id);
      if (res.success) {
        setToast({ message: 'Subscription removed', type: 'success' });
        fetchSubscriptions();
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to delete subscription', type: 'error' });
    }
  };

  const toggleMetric = (metric) => {
    if (selectedMetrics.includes(metric)) {
      setSelectedMetrics(selectedMetrics.filter((m) => m !== metric));
    } else {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
            Automated Email Subscriptions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Receive scheduled weather updates for your selected cities</p>
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
            <Plus className="w-4 h-4" /> New Email Subscription
          </button>
        </div>
      </div>

      {loading && <LoadingSkeleton type="card" count={2} />}

      {!loading && subscriptions.length === 0 && (
        <EmptyState
          title="No Email Subscriptions Active"
          message="Subscribe to a city to receive automated weather updates directly in your inbox."
          actionLabel="Subscribe to a City"
          onAction={() => setShowModal(true)}
          icon={Mail}
        />
      )}

      {/* Subscriptions List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subscriptions.map((sub) => (
          <div key={sub.id} className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm card-hover flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-bold uppercase">
                  <Clock className="w-3.5 h-3.5" /> {sub.frequency}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" /> Active
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 font-heading">{sub.city}</h3>
              <p className="text-xs text-slate-500 mt-1">Recipient: <strong className="text-slate-700">{sub.email}</strong></p>

              {/* Selected Metrics Tags */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {sub.selectedMetrics?.map((m) => (
                  <span key={m} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold uppercase">
                    {m.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100 text-xs">
              <span className="text-slate-400">
                Last sent: {sub.lastSentAt ? new Date(sub.lastSentAt).toLocaleString() : 'Pending schedule'}
              </span>
              <button
                onClick={() => handleDeleteSubscription(sub.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                title="Delete Subscription"
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

      {/* New Subscription Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-heading">New City Subscription</h3>

            <form onSubmit={handleCreateSubscription} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Select City</label>
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
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Update Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
                >
                  <option value="HOURLY">Hourly Update</option>
                  <option value="EVERY_3_HOURS">Every 3 Hours</option>
                  <option value="DAILY">Daily Morning Digest</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Metrics Included</label>
                <div className="grid grid-cols-2 gap-2">
                  {['TEMPERATURE', 'RAIN_PROBABILITY', 'AQI', 'WEATHER_INTELLIGENCE', 'WIND', 'HUMIDITY'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleMetric(m)}
                      className={`p-2 rounded-xl text-xs font-bold border transition ${
                        selectedMetrics.includes(m)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {m.replace('_', ' ')}
                    </button>
                  ))}
                </div>
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
                  Save Subscription
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

export default SubscriptionsPage;
