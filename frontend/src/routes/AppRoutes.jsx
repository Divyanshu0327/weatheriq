import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import MainLayout from '../components/layout/MainLayout';

// Core Weather Pages
import DashboardPage from '../pages/dashboard/DashboardPage';
import ForecastPage from '../pages/forecast/ForecastPage';
import MapPage from '../pages/map/MapPage';
import AirQualityPage from '../pages/airQuality/AirQualityPage';
import TravelPage from '../pages/travel/TravelPage';
import HistoryPage from '../pages/history/HistoryPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Free Public Weather Routes */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/forecast" element={<ForecastPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/air-quality" element={<AirQualityPage />} />
        <Route path="/travel" element={<TravelPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Route>

      {/* Redirect Root & Unknown URLs to Dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
