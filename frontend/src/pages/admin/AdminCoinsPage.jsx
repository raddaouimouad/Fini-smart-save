import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { PageLoader, Toast } from '../../components/UI';
import { Coins, ShieldAlert, ArrowUpRight, ArrowDownLeft, AlertCircle } from 'lucide-react';

export default function AdminCoinsPage() {
  const [users, setUsers] = useState([]);
  const [adjustForm, setAdjustForm] = useState({ userId: '', amount: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    api.get('/admin/users').then(res => setUsers(res.data.users || []));
  }, []);

  const handleAdjust = async (e) => {
    e.preventDefault();
    const amt = parseInt(adjustForm.amount, 10);
    if (!adjustForm.userId || isNaN(amt) || !adjustForm.reason.trim()) {
      showToast('Veuillez sélectionner un utilisateur, un montant et un motif auditable.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/admin/coins/adjust', {
        userId: adjustForm.userId,
        amount: amt,
        reason: adjustForm.reason.trim(),
      });
      showToast(`Ajustement audité effectué. Nouveau solde : ${res.data.newBalance} Coins.`);
      setAdjustForm({ userId: '', amount: '', reason: '' });
      // Refresh users list
      const uRes = await api.get('/admin/users');
      setUsers(uRes.data.users || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de l\'ajustement.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div>
        <h1 className="text-2xl font-bold text-white">Gestion & Régulation des FINI Coins</h1>
        <p className="text-xs text-fini-muted mt-0.5">Contrôlez l'économie des points de fidélité et appliquez des ajustements audités</p>
      </div>

      {/* Rules Card */}
      <div className="card p-5 bg-navy-950/70 border-fini-border space-y-3">
        <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
          <Coins size={18} />
          <span>Politique Monétaire FINI Coins</span>
        </div>
        <ul className="text-xs text-fini-muted space-y-1.5 list-disc list-inside">
          <li><strong>Points de fidélité universels :</strong> Les Coins n'ont aucune valeur de rachat direct en dirhams bancaires.</li>
          <li><strong>Budgets de campagne :</strong> Chaque campagne partenaire doit obligatoirement avoir un plafond maximum de Coins émis pour éviter toute dilution.</li>
          <li><strong>Traçabilité totale :</strong> Chaque mouvement de Coins dispose d'un identifiant unique (referenceId) et d'un solde après transaction.</li>
        </ul>
      </div>

      {/* Auditable Adjustment Tool */}
      <div className="card p-5 border-purple-500/30">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-fini-border">
          <ShieldAlert size={18} className="text-purple-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Outil d'Ajustement Auditable de Solde</h3>
            <p className="text-[11px] text-fini-muted">Toute correction manuelle est enregistrée avec votre identité admin dans le journal d'audit.</p>
          </div>
        </div>

        <form onSubmit={handleAdjust} className="space-y-3.5">
          <div>
            <label className="label">Compte Utilisateur Cible *</label>
            <select
              required
              className="input text-xs"
              value={adjustForm.userId}
              onChange={(e) => setAdjustForm({ ...adjustForm, userId: e.target.value })}
            >
              <option value="">Sélectionnez un compte utilisateur</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.fullName} ({u.email}) — Solde actuel: {u.coinsBalance} Coins
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Montant de l'ajustement (+ ou -) *</label>
              <input
                type="number"
                required
                placeholder="ex: +100 ou -50"
                className="input font-mono"
                value={adjustForm.amount}
                onChange={(e) => setAdjustForm({ ...adjustForm, amount: e.target.value })}
              />
              <p className="text-[10px] text-fini-muted mt-1">Utilisez un signe négatif (-) pour déduire des Coins.</p>
            </div>
            <div>
              <label className="label">Motif officiel (Obligatoire pour l'audit) *</label>
              <input
                type="text"
                required
                placeholder="ex: Correction litige ticket caisse #88912"
                className="input text-xs"
                value={adjustForm.reason}
                onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 mt-2"
          >
            {submitting ? 'Validation de l\'audit...' : '⚡ Appliquer l\'ajustement et signer l\'audit'}
          </button>
        </form>
      </div>
    </div>
  );
}
