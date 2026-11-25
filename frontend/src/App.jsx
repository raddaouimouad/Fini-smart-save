import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';

import AppLayout from './components/AppLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SavingsPage from './pages/SavingsPage';
import CoinsPage from './pages/CoinsPage';
import CouponsPage from './pages/CouponsPage';
import GamingPage from './pages/GamingPage';
import PartnersPage from './pages/PartnersPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminGamingPage from './pages/admin/AdminGamingPage';
import AdminPartnersPage from './pages/admin/AdminPartnersPage';
import AdminCoinsPage from './pages/admin/AdminCoinsPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Landing & Auth Routes */}
          <Route path="/" element={<LandingPage />} />

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected User Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              }
            />
            <Route
              path="/savings/*"
              element={
                <AppLayout>
                  <SavingsPage />
                </AppLayout>
              }
            />
            <Route
              path="/coins"
              element={
                <AppLayout>
                  <CoinsPage />
                </AppLayout>
              }
            />
            <Route
              path="/coupons/*"
              element={
                <AppLayout>
                  <CouponsPage />
                </AppLayout>
              }
            />
            <Route
              path="/gaming/*"
              element={
                <AppLayout>
                  <GamingPage />
                </AppLayout>
              }
            />
            <Route
              path="/partners/*"
              element={
                <AppLayout>
                  <PartnersPage />
                </AppLayout>
              }
            />
            <Route
              path="/notifications"
              element={
                <AppLayout>
                  <NotificationsPage />
                </AppLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <AppLayout>
                  <ProfilePage />
                </AppLayout>
              }
            />
            <Route
              path="/settings"
              element={
                <AppLayout>
                  <ProfilePage />
                </AppLayout>
              }
            />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="coupons" element={<AdminCouponsPage />} />
              <Route path="gaming" element={<AdminGamingPage />} />
              <Route path="partners" element={<AdminPartnersPage />} />
              <Route path="coins" element={<AdminCoinsPage />} />
              <Route path="audit" element={<AdminAuditLogsPage />} />
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
