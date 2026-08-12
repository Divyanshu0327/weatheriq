import React, { useState, useEffect, useRef } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { useAuth } from '../../context/AuthContext';
import { weatherService } from '../../services/weatherService';
import { Search, Menu, MapPin, User, Thermometer, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = ({ onOpenSidebar }) => {
  const { activeLocation, selectCity, temperatureUnit, toggleUnit } = useWeather();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Debounced Location Search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await weatherService.searchLocations(searchQuery);
        if (res.success && res.data) {
          setSearchResults(res.data);
          setShowDropdown(true);
        }
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLocation = (location) => {
    selectCity(location);
    setSearchQuery('');
    setShowDropdown(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 md:px-8 backdrop-blur-md">
      {/* Left: Mobile Menu & Current City */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 text-sm font-semibold">
          <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <span>{activeLocation.city}{activeLocation.country ? `, ${activeLocation.country}` : ''}</span>
        </div>
      </div>

      {/* Middle: Debounced Search Bar */}
      <div className="relative flex-1 max-w-md mx-4" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            placeholder="Search city location (e.g. Delhi, London, Tokyo)..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          />
          {isSearching && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl py-2 max-h-72 overflow-y-auto">
            {searchResults.map((res) => (
              <button
                key={`${res.id}-${res.latitude}-${res.longitude}`}
                onClick={() => handleSelectLocation(res)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition border-b border-slate-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">{res.name}</p>
                  <p className="text-xs text-slate-500">
                    {res.admin1 ? `${res.admin1}, ` : ''}{res.country}
                  </p>
                </div>
                <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                  {res.latitude.toFixed(2)}°, {res.longitude.toFixed(2)}°
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls: Unit Toggle & Profile */}
      <div className="flex items-center gap-3">
        {/* °C / °F Unit Toggle */}
        <button
          onClick={toggleUnit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
          title="Toggle Temperature Unit"
        >
          <Thermometer className="h-4 w-4 text-blue-600" />
          <span>{temperatureUnit === 'CELSIUS' ? '°C' : '°F'}</span>
        </button>

        {/* Profile Shortcut */}
        <Link
          to="/settings"
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
          title="Profile & Settings"
        >
          <User className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
