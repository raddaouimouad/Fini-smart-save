import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { PageLoader, EmptyState, Modal, Toast } from '../../components/UI';
import { Tag, Plus, Pencil, Trash2, Check, X, Search } from 'lucide-react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, coupon: null });
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    title: '',
    code: '',
    merchantName: '',
    category: 'supermarket',
    discountType: 'fixed_amount',
    discountValue: '',
    requiredCoins: '',
    minPurchaseAmount: '0',
    maxRedemptions: '500',
    expirationDate: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/coupons');
      setCoupons(res.data.coupons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    const nextMonth = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
    setForm({
      title: '',
      code: '',
      merchantName: '',
      category: 'supermarket',
      discountType: 'fixed_amount',
      discountValue: '',
      requiredCoins: '',
      minPurchaseAmount: '0',
      maxRedemptions: '500',
      expirationDate: nextMonth,
    });
    setModal({ open: true, coupon: null });
  };

  const handleOpenEdit = (coupon) => {
    setForm({
      title: coupon.title,
      code: coupon.code,
      merchantName: coupon.merchantName,
      category: coupon.category,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      requiredCoins: String(coupon.requiredCoins),
      minPurchaseAmount: String(coupon.minPurchaseAmount || 0),
      maxRedemptions: String(coupon.maxRedemptions || 500),
      expirationDate: coupon.expirationDate ? new Date(coupon.expirationDate).toISOString().substring(0, 10) : '',
    });
    setModal({ open: true, coupon });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        requiredCoins: Number(form.requiredCoins),
        minPurchaseAmount: Number(form.minPurchaseAmount),
        maxRedemptions: Number(form.maxRedemptions),
      };

      if (modal.coupon) {
        await api.put(`/admin/coupons/${modal.coupon._id}`, payload);
        showToast('Coupon mis à jour avec succès.');
      } else {
        await api.post('/admin/coupons', payload);
        showToast('Nouveau coupon créé.');
      }
      setModal({ open: false, coupon: null });
      fetchCoupons();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de l\'enregistrement.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce coupon ?')) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      showToast('Coupon supprimé.');
      fetchCoupons();
    } catch (err) {
      showToast('Erreur lors de la suppression.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion des Coupons & Campagnes</h1>
          <p className="text-xs text-fini-muted mt-0.5">Créez et configurez les réductions échangeables avec les FINI Coins</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn-primary self-start sm:self-auto bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2 px-3.5 flex items-center gap-1.5"
        >
          <Plus size={16} /> Nouveau Coupon
        </button>
      </div>

      {loading ? (
        <PageLoader />
      ) : coupons.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Aucun coupon configuré"
          description="Créez votre première campagne de réduction pour les utilisateurs FINI."
          action={<button onClick={handleOpenCreate} className="btn-primary mx-auto mt-2">Créer un coupon</button>}
        />
      ) : (
        <div className="card p-0 overflow-hidden border-fini-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-950 border-b border-fini-border text-fini-muted uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="p-3.5 pl-4">Coupon</th>
                  <th className="p-3.5">Marchand</th>
                  <th className="p-3.5">Réduction</th>
                  <th className="p-3.5">Coins Requis</th>
                  <th className="p-3.5">Utilisations</th>
                  <th className="p-3.5">Expiration</th>
                  <th className="p-3.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fini-border">
                {coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-fini-card-hover/50 transition-colors">
                    <td className="p-3.5 pl-4">
                      <div>
                        <p className="font-bold text-white">{c.title}</p>
                        <p className="text-[10px] font-mono text-purple-300">{c.code}</p>
                      </div>
                    </td>
                    <td className="p-3.5 font-semibold text-fini-text">{c.merchantName}</td>
                    <td className="p-3.5 font-bold text-mint-400">
                      {c.discountType === 'percentage' ? `-${c.discountValue}%` : `-${c.discountValue} DH`}
                    </td>
                    <td className="p-3.5 font-bold text-yellow-400">🪙 {c.requiredCoins}</td>
                    <td className="p-3.5 text-fini-muted">
                      {c.currentRedemptions || 0} / {c.maxRedemptions || '∞'}
                    </td>
                    <td className="p-3.5 text-fini-muted">
                      {new Date(c.expirationDate).toLocaleDateString('fr-MA')}
                    </td>
                    <td className="p-3.5 pr-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 rounded-lg bg-fini-border text-fini-muted hover:text-white"
                        title="Modifier"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        title="Supprimer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, coupon: null })}
        title={modal.coupon ? 'Modifier le Coupon' : 'Créer un Nouveau Coupon'}
      >
        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="label">Titre du coupon *</label>
            <input
              type="text"
              required
              placeholder="ex: 15 DH de réduction chez BIM"
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Code Référence *</label>
              <input
                type="text"
                required
                placeholder="ex: BIM-15DH-2026"
                className="input font-mono uppercase"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />
            </div>
            <div>
              <label className="label">Enseigne Marchande *</label>
              <input
                type="text"
                required
                placeholder="ex: BIM Maroc"
                className="input"
                value={form.merchantName}
                onChange={(e) => setForm({ ...form, merchantName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Type de remise</label>
              <select
                className="input"
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
              >
                <option value="fixed_amount">Montant fixe (DH)</option>
                <option value="percentage">Pourcentage (%)</option>
              </select>
            </div>
            <div>
              <label className="label">Valeur *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="ex: 15"
                className="input"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Coins requis *</label>
              <input
                type="number"
                required
                min="0"
                placeholder="ex: 150"
                className="input"
                value={form.requiredCoins}
                onChange={(e) => setForm({ ...form, requiredCoins: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Achat minimum (DH)</label>
              <input
                type="number"
                min="0"
                className="input"
                value={form.minPurchaseAmount}
                onChange={(e) => setForm({ ...form, minPurchaseAmount: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Date d'expiration *</label>
              <input
                type="date"
                required
                className="input"
                value={form.expirationDate}
                onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => setModal({ open: false, coupon: null })}
              className="btn-secondary flex-1"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
              {submitting ? 'Enregistrement...' : modal.coupon ? 'Mettre à jour' : 'Créer le coupon'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
