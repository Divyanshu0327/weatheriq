import React, { useState, useRef, useEffect } from 'react';
import { travelService } from '../../services/travelService';
import { weatherService } from '../../services/weatherService';
import { Plane, MapPin, CheckCircle2, Thermometer, Droplets, Wind, Sun, X } from 'lucide-react';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';

const TravelPage = () => {
  const [destination, setDestination] = useState('Mumbai');
  const [destinationInput, setDestinationInput] = useState('Mumbai');
  const [latitude, setLatitude] = useState(19.0760);
  const [longitude, setLongitude] = useState(72.8777);
  const [travelDate, setTravelDate] = useState(new Date().toISOString().split('T')[0]);

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef(null);

  const [travelData, setTravelData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = async (val) => {
    setDestinationInput(val);
    if (!val.trim() || val.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await weatherService.searchLocations(val);
      if (res.success && res.data) {
        setSearchResults(res.data);
      }
    } catch (err) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCity = (cityRes) => {
    const cityName = cityRes.name;
    setDestination(cityName);
    setDestinationInput(cityName);
    setLatitude(cityRes.latitude);
    setLongitude(cityRes.longitude);
    setSearchResults([]);
  };

  const handleClearDestination = () => {
    setDestinationInput('');
    setDestination('');
    setSearchResults([]);
  };

  const handleFetchTravelWeather = async (e) => {
    if (e) e.preventDefault();
    const targetCity = destinationInput.trim() || destination || 'Mumbai';
    setLoading(true);
    setError(null);
    try {
      const res = await travelService.getTravelWeather(targetCity, latitude, longitude, travelDate);
      if (res.success) {
        setTravelData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch travel assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
          Travel Mode — Suitability & Packing Suggestions
        </h1>
        <p className="text-xs text-slate-500 mt-1">Plan trips with expected destination weather insights and packing recommendations</p>
      </div>

      {/* Input Controls */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm">
        <form onSubmit={handleFetchTravelWeather} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Destination City</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={destinationInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Type city name (e.g. Delhi, London, Tokyo)..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
              />
              {destinationInput && (
                <button
                  type="button"
                  onClick={handleClearDestination}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/60 transition"
                  title="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dropdown Results */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl py-1 max-h-56 overflow-y-auto">
                {searchResults.map((r) => (
                  <button
                    key={`${r.id}-${r.latitude}-${r.longitude}`}
                    type="button"
                    onClick={() => handleSelectCity(r)}
                    className="w-full px-4 py-2.5 text-left text-xs font-medium hover:bg-slate-50 text-slate-800 border-b border-slate-100 last:border-0 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-slate-900">{r.name}</span>
                      <span className="text-slate-500 font-normal"> ({r.admin1 ? `${r.admin1}, ` : ''}{r.country})</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Travel Date</label>
            <div className="relative">
              <input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading || !destinationInput.trim()}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2"
            >
              <Plane className="w-4 h-4" /> Check Suitability
            </button>
          </div>
        </form>
      </div>

      {loading && <LoadingSkeleton type="card" count={1} />}
      {error && <ErrorState message={error} onRetry={handleFetchTravelWeather} />}

      {/* Travel Summary Card */}
      {travelData && !loading && (
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-bold uppercase">
                Destination Rating
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 font-heading mt-2">
                {travelData.destination}
              </h2>
              <p className="text-xs text-slate-500 font-medium">Travel Date: {travelData.travelDate}</p>
            </div>

            <div className={`px-6 py-3 rounded-2xl font-extrabold text-xl tracking-wide font-heading ${
              travelData.travelRating === 'EXCELLENT' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
              travelData.travelRating === 'GOOD' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
              travelData.travelRating === 'MODERATE' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
              'bg-rose-100 text-rose-800 border border-rose-300'
            }`}>
              Rating: {travelData.travelRating}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
              <Thermometer className="w-5 h-5 text-blue-600 mb-1" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">Expected Temp</span>
              <p className="text-xl font-extrabold text-slate-800 font-heading">{travelData.expectedTemperature}°C</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
              <Droplets className="w-5 h-5 text-blue-500 mb-1" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">Rain Likelihood</span>
              <p className="text-xl font-extrabold text-slate-800 font-heading">{travelData.rainProbability}%</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
              <Sun className="w-5 h-5 text-amber-500 mb-1" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">UV Index</span>
              <p className="text-xl font-extrabold text-slate-800 font-heading">{travelData.uvIndex || 5.0}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
              <Wind className="w-5 h-5 text-indigo-500 mb-1" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">AQI Index</span>
              <p className="text-xl font-extrabold text-slate-800 font-heading">{travelData.aqi || 80}</p>
            </div>
          </div>

          {/* Packing & Activity Suggestions */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Packing & Suitability Advice</h4>
            <div className="space-y-2">
              {travelData.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl text-xs font-medium text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelPage;
