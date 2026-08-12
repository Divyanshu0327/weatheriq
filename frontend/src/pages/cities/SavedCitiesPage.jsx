import React, { useState, useEffect } from 'react';
import { cityService } from '../../services/cityService';
import { weatherService } from '../../services/weatherService';
import { useWeather } from '../../context/WeatherContext';
import { Building2, Plus, Trash2, Star, MapPin, Search } from 'lucide-react';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import Toast from '../../components/common/Toast';

const SavedCitiesPage = () => {
  const { selectCity } = useWeather();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const fetchCities = async () => {
    setLoading(true);
    try {
      const res = await cityService.getSavedCities();
      if (res.success && res.data) {
        setCities(res.data);
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to fetch saved cities', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

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

  const handleAddCity = async (cityItem) => {
    try {
      const payload = {
        city: cityItem.name,
        country: cityItem.country,
        latitude: cityItem.latitude,
        longitude: cityItem.longitude,
        timezone: cityItem.timezone,
        isDefault: cities.length === 0,
      };
      const res = await cityService.saveCity(payload);
      if (res.success) {
        setToast({ message: `Saved ${cityItem.name} to favorites!`, type: 'success' });
        setShowModal(false);
        setSearchQuery('');
        setSearchResults([]);
        fetchCities();
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to save city', type: 'error' });
    }
  };

  const handleSetDefault = async (cityId) => {
    try {
      const res = await cityService.setDefaultCity(cityId);
      if (res.success) {
        setToast({ message: 'Default city updated!', type: 'success' });
        fetchCities();
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to set default city', type: 'error' });
    }
  };

  const handleDeleteCity = async (cityId) => {
    try {
      const res = await cityService.deleteCity(cityId);
      if (res.success) {
        setToast({ message: 'City deleted', type: 'success' });
        fetchCities();
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to delete city', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
            Saved Cities & Favorite Locations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Quickly access weather for your saved locations</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New City
        </button>
      </div>

      {loading && <LoadingSkeleton type="card" count={3} />}

      {!loading && cities.length === 0 && (
        <EmptyState
          title="No Saved Cities Yet"
          message="Save cities to monitor their weather and receive scheduled updates."
          actionLabel="Add Your First City"
          onAction={() => setShowModal(true)}
        />
      )}

      {/* Cities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities.map((city) => (
          <div
            key={city.id}
            className={`relative rounded-3xl bg-white border p-6 shadow-sm card-hover flex flex-col justify-between ${
              city.isDefault ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200/80'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{city.country || 'Location'}</span>
                {city.isDefault && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-extrabold">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> DEFAULT
                  </span>
                )}
              </div>

              <h3
                onClick={() => selectCity(city)}
                className="text-2xl font-extrabold text-slate-900 font-heading cursor-pointer hover:text-blue-600 transition"
              >
                {city.city}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-1">
                {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
              </p>
            </div>

            <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
              <button
                onClick={() => selectCity(city)}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                View Dashboard →
              </button>

              <div className="flex items-center gap-2">
                {!city.isDefault && (
                  <button
                    onClick={() => handleSetDefault(city.id)}
                    title="Set as Default"
                    className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteCity(city.id)}
                  title="Remove City"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add City Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-heading">Add City to Saved List</h3>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchCity(e.target.value)}
                placeholder="Search city (e.g. Bangalore, Paris)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>

            {searchResults.length > 0 && (
              <div className="max-h-60 overflow-y-auto space-y-1 border border-slate-100 rounded-xl p-1">
                {searchResults.map((res) => (
                  <button
                    key={`${res.id}-${res.latitude}`}
                    onClick={() => handleAddCity(res)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-blue-50 text-left transition"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{res.name}</p>
                      <p className="text-xs text-slate-500">{res.country}</p>
                    </div>
                    <Plus className="w-4 h-4 text-blue-600" />
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default SavedCitiesPage;
