import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { PageLoader, EmptyState, ProgressBar, CoinsBadge } from '../components/UI';
import {
  PiggyBank, Coins, Tag, Gamepad2, Store, TrendingUp,
  ArrowRight, Plus, Target, Bell, ChevronRight
} from 'lucide-react';

function QuickAction({ to, icon: Icon, label, color = 'text-fini-mint', bg = 'bg-mint-500/10' }) {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(to)}
      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-fini-card hover:bg-fini-card-hover border border-fini-border transition-all group">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon size={22} className={color} />
      </div>
      <span className="text-xs font-medium text-fini-muted text-center leading-tight">{label}</span>
    </button>
  );
}

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-fini-muted text-xs font-medium mb-0.5 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-fini-text">{value}</p>
        {sub && <p className="text-xs text-fini-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data.data);
      } catch (err) {
        setError('Impossible de charger le tableau de bord.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <PageLoader />;
  if (error) return <div className="card text-red-400 text-center py-10">{error}</div>;

  const { stats, recentGoals, recentCoinTransactions, recentNotifications, featuredPartners } = data;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-fini-text">{greeting}, {user?.fullName?.split(' ')[0]}! 👋</h1>
          <p className="text-fini-muted text-sm mt-1">Voici un aperçu de votre activité FINI</p>
        </div>
        <Link to="/notifications" className="relative p-2 rounded-xl hover:bg-fini-card transition-all">
          <Bell size={22} className="text-fini-muted" />
          {stats?.unreadNotifications > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-fini-mint rounded-full text-[9px] text-white flex items-center justify-center font-bold">
              {stats.unreadNotifications > 9 ? '9+' : stats.unreadNotifications}
            </span>
          )}
        </Link>
      </div>

      {/* Coins Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-fini-purple via-purple-800 to-navy-800 p-6 border border-purple-500/30">
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10" />
        <div className="relative">
          <p className="text-purple-200 text-sm font-medium mb-1">Vos FINI Coins 🪙</p>
          <p className="text-4xl font-black text-white mb-1">{(user?.coinsBalance || stats?.coinsBalance || 0).toLocaleString('fr-MA')}</p>
          <p className="text-purple-300 text-xs mb-4">Utilisez vos Coins pour obtenir des coupons de réduction</p>
          <Link to="/coins" className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all">
            Voir l'historique <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Épargne déclarée" value={`${(stats?.totalDeclaredSavings || 0).toLocaleString('fr-MA')} DH`}
          icon={PiggyBank} color="bg-fini-mint" sub="Montant déclaré" />
        <StatCard label="Objectifs actifs" value={stats?.activeGoals || 0}
          icon={Target} color="bg-fini-purple" sub="En cours" />
        <StatCard label="Coupons actifs" value={stats?.activeCoupons || 0}
          icon={Tag} color="bg-fini-yellow" sub="Disponibles" />
        <StatCard label="Notifications" value={stats?.unreadNotifications || 0}
          icon={Bell} color="bg-blue-500" sub="Non lues" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="section-title mb-4">Actions rapides</h2>
        <div className="grid grid-cols-5 gap-2">
          <QuickAction to="/savings/quick" icon={PiggyBank} label="Épargner" bg="bg-mint-500/10" color="text-fini-mint" />
          <QuickAction to="/savings/goals/new" icon={Target} label="Nouvel objectif" bg="bg-purple-500/10" color="text-fini-purple" />
          <QuickAction to="/gaming" icon={Gamepad2} label="Gaming" bg="bg-yellow-500/10" color="text-fini-yellow" />
          <QuickAction to="/coupons" icon={Tag} label="Coupons" bg="bg-blue-500/10" color="text-blue-400" />
          <QuickAction to="/partners" icon={Store} label="Partenaires" bg="bg-orange-500/10" color="text-orange-400" />
        </div>
      </div>

      {/* Active Goals */}
      {recentGoals?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Objectifs d'épargne</h2>
            <Link to="/savings" className="text-sm text-fini-mint hover:underline flex items-center gap-1">
              Voir tout <ChevronRight size={15} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentGoals.map(goal => (
              <Link to="/savings" key={goal._id} className="card hover:bg-fini-card-hover transition-all block">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-fini-text text-sm">{goal.name}</span>
                  <span className="text-xs text-fini-mint font-bold">
                    {Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))}%
                  </span>
                </div>
                <ProgressBar value={goal.currentAmount} max={goal.targetAmount} />
                <div className="flex justify-between text-xs text-fini-muted mt-2">
                  <span>{goal.currentAmount.toLocaleString('fr-MA')} DH</span>
                  <span>/ {goal.targetAmount.toLocaleString('fr-MA')} DH</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Notifications */}
      {recentNotifications?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Notifications récentes</h2>
            <Link to="/notifications" className="text-sm text-fini-mint hover:underline flex items-center gap-1">
              Toutes <ChevronRight size={15} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentNotifications.slice(0, 3).map(notif => (
              <div key={notif._id}
                className={`card py-3 px-4 flex items-start gap-3 ${!notif.isRead ? 'border-fini-mint/30 bg-mint-500/5' : ''}`}>
                <div className="w-8 h-8 bg-fini-border rounded-lg flex items-center justify-center flex-shrink-0 text-sm">
                  {!notif.isRead && <div className="w-2 h-2 bg-fini-mint rounded-full" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-fini-text">{notif.title}</p>
                  <p className="text-xs text-fini-muted mt-0.5 line-clamp-1">{notif.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Partners */}
      {featuredPartners?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Partenaires</h2>
            <Link to="/partners" className="text-sm text-fini-mint hover:underline flex items-center gap-1">
              Découvrir <ChevronRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {featuredPartners.map(p => (
              <Link to={`/partners/${p._id}`} key={p._id}
                className="card hover:bg-fini-card-hover transition-all">
                <div className="w-12 h-12 bg-fini-border rounded-xl flex items-center justify-center mb-3">
                  <Store size={22} className="text-fini-muted" />
                </div>
                <p className="font-semibold text-sm text-fini-text">{p.name}</p>
                <p className="text-xs text-fini-muted mt-1 capitalize">{p.category}</p>
                <div className="mt-2 text-xs text-fini-mint">{p.activeCampaignCount} offre{p.activeCampaignCount !== 1 ? 's' : ''}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
        <p className="text-xs text-blue-300">
          ℹ️ <strong>Important:</strong> FINI est une application d'épargne et de récompenses, pas une banque. Les montants d'épargne affichés sont déclaratifs. Les partenariats affichés peuvent être en cours de négociation.
        </p>
      </div>
    </div>
  );
}
