import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  CloudSun,
  LayoutDashboard,
  CalendarDays,
  MapPin,
  Wind,
  Plane,
  History,
  Sparkles,
  X,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: '7-10 Day Forecast', path: '/forecast', icon: CalendarDays },
    { label: 'Weather Map', path: '/map', icon: MapPin },
    { label: 'Air Quality', path: '/air-quality', icon: Wind },
    { label: 'Travel Mode', path: '/travel', icon: Plane },
    { label: 'Weather History', path: '/history', icon: History },
  ];

  const baseNavClasses =
    'flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col bg-slate-900 text-slate-300 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20">
              <CloudSun className="h-6.5 w-6.5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white font-heading">
                Weather<span className="text-blue-500">IQ</span>
              </span>
              <span className="block text-[10px] uppercase font-semibold text-emerald-400 tracking-wider flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Free Weather Platform
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Weather Services
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `${baseNavClasses} ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer Badge */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              <CloudSun className="h-5 w-5" />
            </div>
            <div className="truncate">
              <p className="truncate text-xs font-semibold text-white">WeatherIQ Explorer</p>
              <p className="truncate text-[10px] text-emerald-400 font-medium">100% Free Public Access</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
