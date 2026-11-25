import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-fini-navy flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-fini-mint border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-fini-muted">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

export const PublicRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-fini-navy flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-fini-mint border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};
