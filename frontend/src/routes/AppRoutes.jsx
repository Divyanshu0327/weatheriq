import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Route Guards
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage';
import VerifyEmailPendingPage from '../pages/auth/VerifyEmailPendingPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// Main Application Pages
import DashboardPage from '../pages/dashboard/DashboardPage';
import ForecastPage from '../pages/forecast/ForecastPage';
import MapPage from '../pages/map/MapPage';
import AirQualityPage from '../pages/airQuality/AirQualityPage';
import TravelPage from '../pages/travel/TravelPage';
import HistoryPage from '../pages/history/HistoryPage';
import SavedCitiesPage from '../pages/cities/SavedCitiesPage';
import SubscriptionsPage from '../pages/subscriptions/SubscriptionsPage';
import AlertsPage from '../pages/alerts/AlertsPage';
import SettingsPage from '../pages/settings/SettingsPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/verify-email-pending" element={<VerifyEmailPendingPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected Routes Wrapper */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/forecast" element={<ForecastPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/air-quality" element={<AirQualityPage />} />
          <Route path="/travel" element={<TravelPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/cities" element={<SavedCitiesPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<SettingsPage />} />

          {/* Admin Protected Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<Navigate to="/admin" replace />} />
          </Route>
        </Route>
      </Route>

      {/* Redirect Root to Dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
