import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { PageLoader, EmptyState, CoinsBadge, Toast } from '../components/UI';
import { Coins, ArrowDownLeft, ArrowUpRight, ShieldCheck, Tag, Info, Gift, Award } from 'lucide-react';

export default function CoinsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCoins();
  }, [filter]);

  const fetchCoins = async () => {
    try {
      const url = filter === 'all' ? '/coins' : `/coins?type=${filter}`;
      const res = await api.get(url);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  const transactions = data?.transactions || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-fini-text">🪙 FINI Coins</h1>
        <p className="text-fini-muted text-sm mt-1">Vos points de fidélité universels et votre historique de récompenses</p>
      </div>

      {/* Hero Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-navy-800 border border-yellow-500/30 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-yellow-400">Solde disponible</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-4xl font-extrabold text-white">{(data?.balance || 0).toLocaleString('fr-MA')}</span>
              <span className="text-xl font-bold text-yellow-400">Coins</span>
            </div>
            <p className="text-xs text-fini-muted mt-2">
              Utilisables auprès de tous nos commerçants partenaires pour obtenir des bons d'achat
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/coupons" className="btn-primary bg-yellow-500 hover:bg-yellow-600 text-navy-950 font-bold">
              <Tag size={16} /> Échanger contre des coupons
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-yellow-500/20">
          <div>
            <p className="text-xs text-fini-muted">Total des Coins gagnés</p>
            <p className="text-lg font-bold text-mint-400">+{((data?.stats?.totalEarned) || 0).toLocaleString('fr-MA')} Coins</p>
          </div>
          <div>
            <p className="text-xs text-fini-muted">Total des Coins échangés</p>
            <p className="text-lg font-bold text-red-400">-{((data?.stats?.totalSpent) || 0).toLocaleString('fr-MA')} Coins</p>
          </div>
        </div>
      </div>

      {/* Universal Cross-Merchant Banner */}
      <div className="card bg-purple-950/20 border-purple-500/30 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-400 flex-shrink-0 mt-0.5">
            <Award size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-purple-200">Fidélité Universelle Multi-Enseignes</h3>
            <p className="text-xs text-purple-300/80 mt-1 leading-relaxed">
              C'est la force de FINI : les Coins gagnés lors d'un achat chez <strong>BIM</strong> peuvent être dépensés pour obtenir une réduction chez <strong>Marjane Market</strong>, <strong>Kazyon</strong> ou dans le <strong>Gaming Store</strong> !
            </p>
          </div>
        </div>
      </div>

      {/* Rules Notice */}
      <div className="card bg-navy-900 border-fini-border p-4 text-xs text-fini-muted space-y-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-fini-text">
          <Info size={14} className="text-blue-400" />
          <span>Règles essentielles relatives aux FINI Coins :</span>
        </div>
        <ul className="list-disc list-inside space-y-1 pl-1 text-fini-muted">
          <li>Les FINI Coins sont des points de fidélité et <strong>ne constituent pas de la monnaie réelle</strong>.</li>
          <li>Les Coins ne peuvent en aucun cas être retirés en espèces ou convertis en dirhams sur un compte bancaire.</li>
          <li>L'attribution de Coins est soumise à vérification de tickets ou intégration de caisse POS autorisée.</li>
        </ul>
      </div>

      {/* Transactions History Header & Filter */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-fini-text">Historique des transactions</h2>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'Toutes' },
              { id: 'earned_partner', label: 'Achats partenaires' },
              { id: 'earned_challenge', label: 'Défis épargne' },
              { id: 'redeemed_coupon', label: 'Coupons' },
              { id: 'welcome_bonus', label: 'Bienvenue' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  filter === tab.id
                    ? 'bg-fini-mint/20 border-fini-mint text-fini-mint font-semibold'
                    : 'border-fini-border text-fini-muted hover:text-fini-text'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {transactions.length === 0 ? (
          <EmptyState
            icon={Coins}
            title="Aucune transaction de Coins"
            description="Participez à des défis d'épargne ou réalisez des achats éligibles pour accumuler vos premiers Coins."
          />
        ) : (
          <div className="space-y-2">
            {transactions.map(tx => {
              const isPositive = tx.amount > 0;
              return (
                <div key={tx._id} className="card p-3.5 flex items-center justify-between hover:bg-fini-card-hover transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isPositive ? 'bg-mint-500/10 text-mint-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {isPositive ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-fini-text">{tx.description}</p>
                      <p className="text-xs text-fini-muted mt-0.5">
                        {new Date(tx.createdAt).toLocaleDateString('fr-MA', {
                          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                        {tx.partner?.name && ` · ${tx.partner.name}`}
                        {tx.referenceId && ` · Réf: ${tx.referenceId}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${isPositive ? 'text-mint-400' : 'text-red-400'}`}>
                      {isPositive ? `+${tx.amount}` : tx.amount} Coins
                    </span>
                    <p className="text-[11px] text-fini-muted mt-0.5">Solde: {tx.balanceAfter}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
