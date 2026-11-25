import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { PageLoader, EmptyState, Modal, Toast } from '../components/UI';
import { Tag, Sparkles, CheckCircle, Clock, AlertCircle, QrCode, Search, Store, ArrowRight } from 'lucide-react';

export default function CouponsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'my-coupons'
  const [coupons, setCoupons] = useState([]);
  const [myCoupons, setMyCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [redeemModal, setRedeemModal] = useState({ open: false, coupon: null });
  const [qrModal, setQrModal] = useState({ open: false, redemption: null });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (activeTab === 'browse') {
      fetchCoupons();
    } else {
      fetchMyCoupons();
    }
  }, [activeTab, category, search]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);
      if (search) params.append('search', search);
      const res = await api.get(`/coupons?${params.toString()}`);
      setCoupons(res.data.coupons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/coupons/my-coupons');
      setMyCoupons(res.data.redemptions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!redeemModal.coupon) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/coupons/redeem/${redeemModal.coupon._id}`);
      showToast('Félicitations ! Coupon obtenu avec succès. 🎉');
      if (res.data.newCoinsBalance !== undefined) {
        updateUser({ coinsBalance: res.data.newCoinsBalance });
      }
      setRedeemModal({ open: false, coupon: null });
      // Switch to my coupons and show QR code immediately
      setActiveTab('my-coupons');
      setQrModal({ open: true, redemption: res.data.redemption });
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de l\'échange de coupon.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    { id: 'all', label: 'Tous' },
    { id: 'supermarket', label: 'Supermarchés' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'restaurant', label: 'Restauration' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'special', label: 'Offres Spéciales' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fini-text">🎟️ Bons de réduction & Récompenses</h1>
          <p className="text-fini-muted text-sm mt-1">Échangez vos FINI Coins contre des bons d'achat valables en magasin</p>
        </div>
        <div className="flex items-center gap-2 bg-fini-card border border-fini-border p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'browse' ? 'bg-fini-mint text-white' : 'text-fini-muted hover:text-white'
            }`}
          >
            Découvrir les offres
          </button>
          <button
            onClick={() => setActiveTab('my-coupons')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'my-coupons' ? 'bg-fini-mint text-white' : 'text-fini-muted hover:text-white'
            }`}
          >
            Mes coupons ({myCoupons.length})
          </button>
        </div>
      </div>

      {activeTab === 'browse' ? (
        <>
          {/* Search & Categories */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fini-muted" />
              <input
                type="text"
                placeholder="Rechercher une enseigne ou une offre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`text-xs px-3.5 py-2.5 rounded-xl border whitespace-nowrap transition-all ${
                    category === cat.id
                      ? 'bg-fini-mint/20 border-fini-mint text-fini-mint font-bold'
                      : 'border-fini-border text-fini-muted hover:text-fini-text'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* User Coins Notice */}
          <div className="flex items-center justify-between p-3.5 bg-navy-900 border border-fini-border rounded-xl">
            <span className="text-xs text-fini-muted">Votre solde disponible :</span>
            <span className="text-sm font-extrabold text-yellow-400">🪙 {(user?.coinsBalance || 0).toLocaleString('fr-MA')} Coins</span>
          </div>

          {loading ? (
            <PageLoader />
          ) : coupons.length === 0 ? (
            <EmptyState
              icon={Tag}
              title="Aucun coupon disponible"
              description="Aucun coupon ne correspond à votre filtre actuel. Revenez bientôt pour découvrir de nouvelles offres !"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((coupon) => {
                const canAfford = (user?.coinsBalance || 0) >= coupon.requiredCoins;
                return (
                  <div key={coupon._id} className="card relative flex flex-col justify-between hover:border-fini-mint/40 transition-all group">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-fini-mint/10 border border-fini-mint/20 flex items-center justify-center font-bold text-fini-mint text-sm">
                            {coupon.merchantName?.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-fini-muted uppercase">{coupon.merchantName}</span>
                            <h3 className="text-base font-bold text-fini-text leading-tight">{coupon.title}</h3>
                          </div>
                        </div>
                        <span className="badge-purple font-mono text-[11px] font-bold">
                          {coupon.discountType === 'percentage' ? `-${coupon.discountValue}%` : `-${coupon.discountValue} DH`}
                        </span>
                      </div>

                      <div className="mt-4 space-y-1.5 text-xs text-fini-muted">
                        {coupon.minPurchaseAmount > 0 && (
                          <p>• Achat min. : <strong className="text-fini-text">{coupon.minPurchaseAmount} DH</strong></p>
                        )}
                        <p>• Valable jusqu'au : <strong className="text-fini-text">{new Date(coupon.expirationDate).toLocaleDateString('fr-MA')}</strong></p>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-fini-border flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-extrabold text-yellow-400">🪙 {coupon.requiredCoins}</span>
                        <span className="text-xs text-fini-muted">Coins</span>
                      </div>
                      <button
                        onClick={() => setRedeemModal({ open: true, coupon })}
                        disabled={!canAfford}
                        className={`text-xs font-bold py-2 px-3.5 rounded-xl transition-all ${
                          canAfford
                            ? 'bg-fini-mint text-white hover:bg-mint-600'
                            : 'bg-fini-border text-fini-muted cursor-not-allowed opacity-60'
                        }`}
                      >
                        {canAfford ? 'Obtenir le coupon' : 'Coins insuffisants'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* My Coupons Tab */
        <>
          {loading ? (
            <PageLoader />
          ) : myCoupons.length === 0 ? (
            <EmptyState
              icon={Tag}
              title="Vous n'avez pas encore de coupons"
              description="Échangez vos FINI Coins contre des bons de réduction pour les retrouver ici et les utiliser lors de votre passage en caisse."
              action={
                <button onClick={() => setActiveTab('browse')} className="btn-primary mx-auto mt-2">
                  Découvrir les offres disponibles
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myCoupons.map((item) => {
                const isExpired = item.status === 'expired' || new Date(item.expiresAt) < new Date();
                const isUsed = item.status === 'used';
                const isActive = item.status === 'active' && !isExpired;

                return (
                  <div key={item._id} className="card p-4 relative flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-semibold text-fini-muted uppercase">{item.coupon?.merchantName || 'Partenaire'}</span>
                          <h3 className="text-base font-bold text-fini-text">{item.coupon?.title}</h3>
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isActive ? 'badge-green' : isUsed ? 'bg-blue-500/10 text-blue-400' : 'badge-red'
                        }`}>
                          {isActive ? 'Actif' : isUsed ? 'Utilisé' : 'Expiré'}
                        </span>
                      </div>

                      <div className="my-4 p-3 bg-navy-950/60 border border-dashed border-fini-border rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-fini-muted uppercase">Code promo unique</p>
                          <p className="text-sm font-mono font-bold text-fini-mint tracking-wider">{item.uniqueCode}</p>
                        </div>
                        <QrCode size={28} className="text-fini-muted" />
                      </div>

                      <p className="text-xs text-fini-muted">
                        Expire le : <strong className="text-fini-text">{new Date(item.expiresAt).toLocaleDateString('fr-MA')}</strong>
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-fini-border">
                      <button
                        onClick={() => setQrModal({ open: true, redemption: item })}
                        className="btn-secondary w-full text-xs font-semibold py-2"
                      >
                        <QrCode size={15} /> Afficher le QR Code en caisse
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={redeemModal.open}
        onClose={() => setRedeemModal({ open: false, coupon: null })}
        title="Confirmer l'échange de Coins"
      >
        {redeemModal.coupon && (
          <div className="space-y-4">
            <div className="p-4 bg-navy-950 rounded-xl border border-fini-border">
              <span className="text-xs text-fini-muted uppercase font-semibold">{redeemModal.coupon.merchantName}</span>
              <h4 className="text-lg font-bold text-white mt-0.5">{redeemModal.coupon.title}</h4>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-fini-border text-sm">
                <span className="text-fini-muted">Coût de l'échange :</span>
                <span className="font-extrabold text-yellow-400">🪙 {redeemModal.coupon.requiredCoins} Coins</span>
              </div>
            </div>

            <p className="text-xs text-fini-muted">
              Un coupon unique avec QR code vous sera attribué immédiatement. Vous pourrez le présenter lors de votre passage en caisse.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setRedeemModal({ open: false, coupon: null })}
                className="btn-secondary flex-1"
              >
                Annuler
              </button>
              <button
                onClick={handleRedeem}
                disabled={submitting}
                className="btn-primary flex-1 bg-fini-mint hover:bg-mint-600 font-bold"
              >
                {submitting ? 'Validation...' : 'Confirmer l\'échange'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* QR Code Presentation Modal */}
      <Modal
        isOpen={qrModal.open}
        onClose={() => setQrModal({ open: false, redemption: null })}
        title="Présentation en caisse"
      >
        {qrModal.redemption && (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-white rounded-2xl w-56 h-56 mx-auto flex flex-col items-center justify-center shadow-lg">
              {/* Visual Simulated QR Code */}
              <div className="w-44 h-44 bg-navy-950 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-10 h-10 border-4 border-white flex items-center justify-center">
                    <div className="w-4 h-4 bg-white" />
                  </div>
                  <div className="w-10 h-10 border-4 border-white flex items-center justify-center">
                    <div className="w-4 h-4 bg-white" />
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="px-2 py-1 bg-white text-navy-950 font-black text-[10px] tracking-widest rounded">
                    FINI
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="w-10 h-10 border-4 border-white flex items-center justify-center">
                    <div className="w-4 h-4 bg-white" />
                  </div>
                  <div className="w-10 h-10 border-2 border-dashed border-white" />
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-fini-muted uppercase font-semibold">Code de validation caisse</p>
              <p className="text-xl font-mono font-black text-fini-mint mt-1 tracking-wider">
                {qrModal.redemption.uniqueCode}
              </p>
              <p className="text-xs text-fini-muted mt-2">
                Présentez ce QR Code ou ce numéro au caissier lors de votre paiement.
              </p>
            </div>

            <button
              onClick={() => setQrModal({ open: false, redemption: null })}
              className="btn-primary w-full mt-2"
            >
              Fermer
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
