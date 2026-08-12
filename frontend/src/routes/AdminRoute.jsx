import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const AdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        <LoadingSkeleton type="card" count={1} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;
