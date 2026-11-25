import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Tag, Gamepad2, Store, Coins, FileText,
  Shield, ArrowLeft, LogOut, Menu, X, ChevronRight, Zap
} from 'lucide-react';

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Vue d\'ensemble', end: true },
  { to: '/admin/users', icon: Users, label: 'Utilisateurs' },
  { to: '/admin/coupons', icon: Tag, label: 'Gestion Coupons' },
  { to: '/admin/gaming', icon: Gamepad2, label: 'Gaming Store' },
  { to: '/admin/partners', icon: Store, label: 'Partenaires' },
  { to: '/admin/coins', icon: Coins, label: 'FINI Coins' },
  { to: '/admin/audit', icon: FileText, label: 'Audit Logs' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-fini-navy text-fini-text">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Admin Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen z-50 w-64 bg-navy-950 border-r border-purple-500/20 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        <div className="p-5 border-b border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center font-black text-white text-sm">
              <Shield size={16} />
            </div>
            <div>
              <span className="font-black text-white tracking-tight">FINI Admin</span>
              <p className="text-[10px] text-purple-400 uppercase tracking-widest font-semibold">Console Centrale</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-fini-muted hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Back to User App button */}
        <div className="p-3 border-b border-purple-500/10">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
          >
            <ArrowLeft size={14} /> Retour à l'application utilisateur
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {adminNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-fini-muted hover:text-white hover:bg-fini-card-hover'
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Admin profile footer */}
        <div className="p-4 border-t border-purple-500/20 bg-navy-950/80">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.fullName}</p>
              <p className="text-[10px] text-purple-400 font-mono truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              title="Déconnexion"
              className="p-1.5 text-fini-muted hover:text-red-400 rounded-lg transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-fini-border bg-navy-900 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-fini-muted hover:text-white">
            <Menu size={22} />
          </button>
          <span className="font-bold text-white text-sm">FINI Admin Console</span>
          <Link to="/dashboard" className="text-xs text-purple-400 font-semibold">
            App
          </Link>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
