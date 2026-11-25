import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { PageLoader, EmptyState, Toast, Modal } from '../../components/UI';
import { Gamepad2, ShoppingCart, CheckCircle, Clock, RotateCcw, AlertTriangle } from 'lucide-react';

export default function AdminGamingPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'products'
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'orders') {
        const res = await api.get('/admin/orders');
        setOrders(res.data.orders || []);
      } else {
        const res = await api.get('/admin/products');
        setProducts(res.data.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      showToast(`Statut mis à jour : ${newStatus}`);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      showToast('Erreur de mise à jour.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion Gaming Store</h1>
          <p className="text-xs text-fini-muted mt-0.5">Suivi des commandes de crédits digitaux et catalogue des jeux</p>
        </div>
        <div className="flex gap-2 bg-navy-950 p-1 rounded-xl border border-fini-border self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'orders' ? 'bg-purple-600 text-white' : 'text-fini-muted hover:text-white'
            }`}
          >
            Commandes ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'products' ? 'bg-purple-600 text-white' : 'text-fini-muted hover:text-white'
            }`}
          >
            Produits & Packages
          </button>
        </div>
      </div>

      {loading ? (
        <PageLoader />
      ) : activeTab === 'orders' ? (
        orders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Aucune commande gaming"
            description="Les commandes passées par les utilisateurs apparaîtront ici."
          />
        ) : (
          <div className="card p-0 overflow-hidden border-fini-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-950 border-b border-fini-border text-fini-muted uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="p-3.5 pl-4">N° Commande</th>
                    <th className="p-3.5">Client</th>
                    <th className="p-3.5">Produit & Pack</th>
                    <th className="p-3.5">ID Joueur</th>
                    <th className="p-3.5">Prix (MAD)</th>
                    <th className="p-3.5">Statut</th>
                    <th className="p-3.5 pr-4 text-right">Changer statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fini-border">
                  {orders.map((o) => (
                    <tr key={o._id} className="hover:bg-fini-card-hover/50 transition-colors">
                      <td className="p-3.5 pl-4 font-mono font-bold text-fini-mint">{o.orderNumber}</td>
                      <td className="p-3.5">
                        <p className="font-semibold text-white">{o.user?.fullName || 'Utilisateur'}</p>
                        <p className="text-[10px] text-fini-muted">{o.user?.email}</p>
                      </td>
                      <td className="p-3.5">
                        <p className="font-bold text-white">{o.productName}</p>
                        <p className="text-[11px] text-purple-300 font-semibold">{o.packageName}</p>
                      </td>
                      <td className="p-3.5 font-mono text-white">{o.playerIdOrAccount}</td>
                      <td className="p-3.5 font-bold text-white">{o.priceMAD} DH</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.status === 'completed' ? 'badge-green' : o.status === 'processing' ? 'badge-blue' : 'badge-yellow'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="p-3.5 pr-4 text-right">
                        <select
                          className="bg-navy-950 border border-fini-border rounded-lg text-[11px] p-1 text-fini-text focus:outline-none"
                          value={o.status}
                          onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                        >
                          <option value="paid">Payé</option>
                          <option value="processing">En traitement</option>
                          <option value="completed">Complété</option>
                          <option value="refunded">Remboursé</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Products Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((p) => (
            <div key={p._id} className="card p-4">
              <div className="flex items-start justify-between pb-3 border-b border-fini-border">
                <div>
                  <h3 className="font-bold text-white text-base">{p.name}</h3>
                  <p className="text-xs text-fini-muted">{p.gameTitle} · {p.category}</p>
                </div>
                <span className="badge-green text-xs font-semibold">Disponible</span>
              </div>
              <div className="mt-3 space-y-1.5">
                <p className="text-xs font-semibold text-fini-muted uppercase">Packages configurés :</p>
                <div className="space-y-1">
                  {p.packages?.map((pkg, idx) => (
                    <div key={idx} className="p-2 bg-navy-950 rounded-lg text-xs flex justify-between items-center">
                      <span className="font-semibold text-white">{pkg.packageName}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-yellow-400 font-semibold">+{pkg.bonusCoins} Coins</span>
                        <span className="font-bold text-fini-mint">{pkg.priceMAD} DH</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
