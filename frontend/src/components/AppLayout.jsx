import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, PiggyBank, Coins, Tag, Gamepad2, Store, Bell,
  User, Settings, LogOut, ChevronDown, Shield, Menu, X, Zap
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/savings', icon: PiggyBank, label: 'Épargne' },
  { to: '/coins', icon: Coins, label: 'FINI Coins' },
  { to: '/coupons', icon: Tag, label: 'Coupons' },
  { to: '/gaming', icon: Gamepad2, label: 'Gaming Store' },
  { to: '/partners', icon: Store, label: 'Partenaires' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
];

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  return (
    <div className="flex min-h-screen bg-fini-navy">
      {/* Sidebar Overlay Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen z-50 w-64 bg-navy-900 border-r border-fini-border flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-fini-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-fini-mint rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <span className="text-lg font-black text-white tracking-tight">FINI</span>
              <p className="text-xs text-fini-muted leading-none">Save. Play. Shop.</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-fini-muted hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <div className="pt-4 pb-2">
                <p className="text-xs text-fini-muted uppercase tracking-wider font-medium px-4">Administration</p>
              </div>
              <NavLink
                to="/admin"
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}
              >
                <Shield size={18} />
                Admin Dashboard
              </NavLink>
            </>
          )}
        </nav>

        {/* User menu */}
        <div className="p-4 border-t border-fini-border">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-fini-card-hover transition-all"
            >
              <div className="w-9 h-9 bg-fini-mint/20 rounded-full flex items-center justify-center text-fini-mint font-bold text-sm flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-fini-text truncate">{user?.fullName}</p>
                <p className="text-xs text-fini-muted truncate">{user?.email}</p>
              </div>
              <ChevronDown size={16} className={`text-fini-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-navy-900 border border-fini-border rounded-xl shadow-xl overflow-hidden">
                <NavLink to="/profile" onClick={() => { setUserMenuOpen(false); setSidebarOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-fini-muted hover:text-fini-text hover:bg-fini-card-hover transition-all">
                  <User size={16} /> Mon Profil
                </NavLink>
                <NavLink to="/settings" onClick={() => { setUserMenuOpen(false); setSidebarOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-fini-muted hover:text-fini-text hover:bg-fini-card-hover transition-all">
                  <Settings size={16} /> Paramètres
                </NavLink>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-all">
                  <LogOut size={16} /> Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-fini-border bg-navy-900 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-fini-muted hover:text-white">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-fini-mint rounded-lg flex items-center justify-center">
              <Zap size={13} className="text-white" />
            </div>
            <span className="text-base font-black text-white">FINI</span>
          </div>
          <NavLink to="/notifications" className="text-fini-muted hover:text-fini-mint">
            <Bell size={20} />
          </NavLink>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 lg:p-6 pb-24 lg:pb-6">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-navy-900 border-t border-fini-border px-2 py-2 z-30">
          <div className="flex items-center justify-around">
            {[
              { to: '/dashboard', icon: LayoutDashboard, label: 'Accueil' },
              { to: '/savings', icon: PiggyBank, label: 'Épargne' },
              { to: '/coupons', icon: Tag, label: 'Coupons' },
              { to: '/gaming', icon: Gamepad2, label: 'Gaming' },
              { to: '/profile', icon: User, label: 'Profil' },
            ].map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) => isActive ? 'mobile-nav-link-active' : 'mobile-nav-link'}>
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
