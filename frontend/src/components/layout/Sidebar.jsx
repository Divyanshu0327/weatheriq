import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  CloudSun,
  LayoutDashboard,
  CalendarDays,
  MapPin,
  Wind,
  Plane,
  History,
  Building2,
  Mail,
  Bell,
  Settings,
  ShieldCheck,
  LogOut,
  X,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: '7-10 Day Forecast', path: '/forecast', icon: CalendarDays },
    { label: 'Weather Map', path: '/map', icon: MapPin },
    { label: 'Air Quality', path: '/air-quality', icon: Wind },
    { label: 'Travel Mode', path: '/travel', icon: Plane },
    { label: 'Weather History', path: '/history', icon: History },
    { label: 'Saved Cities', path: '/cities', icon: Building2 },
    { label: 'Email Subscriptions', path: '/subscriptions', icon: Mail },
    { label: 'Smart Alerts', path: '/alerts', icon: Bell },
    { label: 'Settings & Profile', path: '/settings', icon: Settings },
  ];

  if (isAdmin) {
    navItems.push({ label: 'Admin Control Center', path: '/admin', icon: ShieldCheck });
  }

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
              <span className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Intelligence Platform
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
            Main Navigation
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

        {/* User Footer Profile */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-800/50">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="truncate text-xs font-semibold text-white">{user?.name || 'User'}</p>
                <p className="truncate text-[11px] text-slate-400">{user?.email || ''}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
