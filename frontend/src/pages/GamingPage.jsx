import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { PageLoader, EmptyState, Modal, Toast } from '../components/UI';
import { Gamepad2, Zap, CheckCircle2, ShoppingCart, ShieldAlert, Sparkles, Clock, AlertTriangle } from 'lucide-react';

export default function GamingPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('store'); // 'store' or 'orders'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [orderModal, setOrderModal] = useState(false);
  const [playerId, setPlayerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('demo_payment');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (activeTab === 'store') {
      fetchProducts();
    } else {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/gaming/products');
      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/gaming/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOrder = (product, pkg) => {
    setSelectedProduct(product);
    setSelectedPackage(pkg);
    setPlayerId('');
    setOrderModal(true);
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    if (!playerId.trim()) {
      showToast("Veuillez renseigner l'identifiant du joueur ou du compte.", 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/gaming/orders', {
        productId: selectedProduct._id,
        packageName: selectedPackage.packageName,
        playerIdOrAccount: playerId.trim(),
        paymentMethod,
      });

      showToast(`Commande ${res.data.order.orderNumber} validée ! Coins bonus crédités. 🎮`);
      if (selectedPackage.bonusCoins > 0) {
        updateUser({ coinsBalance: (user?.coinsBalance || 0) + selectedPackage.bonusCoins });
      }
      setOrderModal(false);
      setActiveTab('orders');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de la commande.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const paymentOptions = [
    { id: 'demo_payment', name: 'Simulation Démo FINI', desc: 'Validation instantanée pour test' },
    { id: 'cash_plus', name: 'Cash Plus', desc: 'Paiement en agence Cash Plus (Prêt pour intégration)' },
    { id: 'wafacash', name: 'Wafacash', desc: 'Réseau Wafacash (Prêt pour intégration)' },
    { id: 'cmi_card', name: 'Carte bancaire CMI', desc: 'Paiement par carte marocaine' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fini-text">🎮 FINI Gaming Store</h1>
          <p className="text-fini-muted text-sm mt-1">Crédits de jeux & cartes cadeaux au Maroc en Dirhams avec bonus en FINI Coins</p>
        </div>
        <div className="flex items-center gap-2 bg-fini-card border border-fini-border p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'store' ? 'bg-fini-mint text-white' : 'text-fini-muted hover:text-white'
            }`}
          >
            Boutique Gaming
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'orders' ? 'bg-fini-mint text-white' : 'text-fini-muted hover:text-white'
            }`}
          >
            Mes commandes
          </button>
        </div>
      </div>

      {/* Demo Architecture Notice */}
      <div className="card bg-amber-500/10 border-amber-500/30 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <strong className="font-semibold text-amber-400">Environnement de Démonstration :</strong> Le Gaming Store présente l'expérience utilisateur et l'architecture de paiement locale. Dans cette version pilote, les commandes s'exécutent en mode démonstration sans débit bancaire réel. L'intégration API avec les grossistes et passerelles (Cash Plus, CMI) sera activée en Phase 3.
          </div>
        </div>
      </div>

      {activeTab === 'store' ? (
        loading ? (
          <PageLoader />
        ) : (
          <div className="space-y-8">
            {products.map((product) => (
              <div key={product._id} className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-fini-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center font-black text-purple-300 text-lg">
                      🎮
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-fini-text">{product.name}</h2>
                      <p className="text-xs text-fini-muted">{product.description}</p>
                    </div>
                  </div>
                  <span className="badge-purple self-start sm:self-auto text-xs font-semibold uppercase">
                    {product.category}
                  </span>
                </div>

                {/* Packages Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
                  {product.packages.map((pkg, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-navy-950/60 rounded-xl border border-fini-border hover:border-fini-mint/50 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-bold text-white">{pkg.packageName}</span>
                          {pkg.badge && (
                            <span className="badge-yellow text-[10px] font-bold py-0.5 px-2">
                              {pkg.badge}
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex items-baseline gap-2">
                          <span className="text-xl font-black text-fini-mint">{pkg.priceMAD} DH</span>
                        </div>

                        {pkg.bonusCoins > 0 && (
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-yellow-400 mt-1">
                            <Sparkles size={12} /> +{pkg.bonusCoins} FINI Coins offerts
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleOpenOrder(product, pkg)}
                        className="btn-primary w-full mt-4 text-xs font-bold py-2 bg-fini-mint hover:bg-mint-600"
                      >
                        <ShoppingCart size={14} /> Commander
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Orders Tab */
        loading ? (
          <PageLoader />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Gamepad2}
            title="Aucune commande de jeu pour l'instant"
            description="Rechargez vos jeux préférés (PUBG, Free Fire, etc.) et gagnez des FINI Coins sur chaque achat."
            action={
              <button onClick={() => setActiveTab('store')} className="btn-primary mx-auto mt-2">
                Visiter le Gaming Store
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order._id} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-fini-mint">{order.orderNumber}</span>
                    <span className="badge-green text-[10px] font-bold">Complétée (Démo)</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    {order.productName} — {order.packageName}
                  </h3>
                  <p className="text-xs text-fini-muted mt-1">
                    ID Joueur : <strong className="text-fini-text">{order.playerIdOrAccount}</strong> · Date : {new Date(order.createdAt).toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-fini-border">
                  <span className="text-base font-black text-white">{order.priceMAD} DH</span>
                  {order.coinsEarned > 0 && (
                    <span className="text-xs font-semibold text-yellow-400 mt-0.5">
                      +{order.coinsEarned} Coins gagnés 🪙
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Order Modal */}
      <Modal
        isOpen={orderModal}
        onClose={() => setOrderModal(false)}
        title="Finaliser la commande gaming"
      >
        {selectedProduct && selectedPackage && (
          <form onSubmit={handleConfirmOrder} className="space-y-4">
            <div className="p-3.5 bg-navy-950 rounded-xl border border-fini-border space-y-1">
              <span className="text-xs text-fini-muted uppercase font-bold">{selectedProduct.name}</span>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white">{selectedPackage.packageName}</span>
                <span className="text-lg font-black text-fini-mint">{selectedPackage.priceMAD} DH</span>
              </div>
              {selectedPackage.bonusCoins > 0 && (
                <p className="text-xs text-yellow-400 font-semibold pt-1 border-t border-fini-border/50">
                  🪙 Bonus : +{selectedPackage.bonusCoins} FINI Coins crédités sur votre compte
                </p>
              )}
            </div>

            <div>
              <label className="label">{selectedProduct.accountInputLabel || 'Identifiant de compte / ID Joueur'} *</label>
              <input
                type="text"
                required
                placeholder={selectedProduct.accountInputPlaceholder || 'Ex: 5123456789'}
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                className="input font-mono"
              />
              <p className="text-[11px] text-fini-muted mt-1">
                Assurez-vous de saisir le bon identifiant pour la livraison directe.
              </p>
            </div>

            <div>
              <label className="label">Mode de paiement</label>
              <div className="space-y-2">
                {paymentOptions.map((opt) => (
                  <label
                    key={opt.id}
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === opt.id
                        ? 'bg-fini-mint/10 border-fini-mint'
                        : 'border-fini-border bg-navy-950/40 hover:bg-fini-card-hover'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={opt.id}
                      checked={paymentMethod === opt.id}
                      onChange={() => setPaymentMethod(opt.id)}
                      className="mt-0.5 accent-mint-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{opt.name}</p>
                      <p className="text-[11px] text-fini-muted">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOrderModal(false)}
                className="btn-secondary flex-1"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1 bg-fini-mint hover:bg-mint-600 font-bold"
              >
                {submitting ? 'Validation...' : `Payer ${selectedPackage.priceMAD} DH`}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
