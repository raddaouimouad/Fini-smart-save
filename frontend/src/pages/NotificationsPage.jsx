import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { PageLoader, EmptyState, Toast } from '../components/UI';
import { Bell, CheckCheck, Target, Gift, Coins, Tag, Gamepad2, Info } from 'lucide-react';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id, link) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      if (link) navigate(link);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      showToast('Toutes les notifications sont marquées comme lues.');
    } catch (err) {
      showToast('Erreur serveur.', 'error');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'saving_goal_progress':
      case 'saving_reminder':
        return <Target size={18} className="text-fini-mint" />;
      case 'coins_earned':
        return <Coins size={18} className="text-yellow-400" />;
      case 'coupon_redeemed':
      case 'coupon_new':
        return <Tag size={18} className="text-purple-400" />;
      case 'gaming_order_update':
        return <Gamepad2 size={18} className="text-blue-400" />;
      case 'welcome':
        return <Gift size={18} className="text-pink-400" />;
      default:
        return <Info size={18} className="text-fini-muted" />;
    }
  };

  if (loading) return <PageLoader />;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fini-text">🔔 Centre de Notifications</h1>
          <p className="text-fini-muted text-sm mt-1">
            Restez informé de votre épargne, de vos Coins et de vos récompenses
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="btn-secondary self-start sm:self-auto text-xs font-semibold py-2"
          >
            <CheckCheck size={16} /> Tout marquer comme lu
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Aucune notification"
          description="Vous êtes à jour ! Vos prochaines alertes d'épargne et de récompenses apparaîtront ici."
        />
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleMarkAsRead(n._id, n.link)}
              className={`card p-4 flex items-start gap-3.5 cursor-pointer transition-all hover:bg-fini-card-hover ${
                !n.isRead ? 'border-fini-mint/30 bg-mint-500/5' : 'opacity-85'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-navy-950 border border-fini-border flex items-center justify-center flex-shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-sm ${!n.isRead ? 'font-bold text-white' : 'font-medium text-fini-text'}`}>
                    {n.title}
                  </h3>
                  <span className="text-[11px] text-fini-muted whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleDateString('fr-MA', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
                <p className="text-xs text-fini-muted mt-1 leading-relaxed">
                  {n.message}
                </p>
              </div>
              {!n.isRead && (
                <div className="w-2.5 h-2.5 rounded-full bg-fini-mint flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
