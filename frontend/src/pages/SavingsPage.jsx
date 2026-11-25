import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { PageLoader, EmptyState, ProgressBar, Modal, Toast } from '../components/UI';
import { Plus, Target, PiggyBank, Calendar, Pencil, Trash2, ChevronRight, TrendingUp, Flame, ArrowUp } from 'lucide-react';

// === SAVING GOALS TAB ===
function GoalsTab() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, goal: null });
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ name: '', targetAmount: '', targetDate: '', description: '', category: 'other' });
  const [saving, setSaving] = useState(false);
  const [addMoneyModal, setAddMoneyModal] = useState({ open: false, goal: null, amount: '' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await api.get('/savings/goals');
      setGoals(res.data.goals);
    } catch {}
    setLoading(false);
  };

  const openCreate = () => {
    setForm({ name: '', targetAmount: '', targetDate: '', description: '', category: 'other' });
    setModal({ open: true, goal: null });
  };

  const openEdit = (goal) => {
    setForm({ name: goal.name, targetAmount: goal.targetAmount, targetDate: goal.targetDate?.substring(0, 10) || '', description: goal.description, category: goal.category });
    setModal({ open: true, goal });
  };

  const handleSave = async () => {
    if (!form.name || !form.targetAmount) {
      showToast('Nom et montant requis.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (modal.goal) {
        await api.put(`/savings/goals/${modal.goal._id}`, form);
        showToast('Objectif mis à jour!');
      } else {
        await api.post('/savings/goals', form);
        showToast('Objectif créé avec 50 Coins de bonus!');
      }
      setModal({ open: false, goal: null });
      fetchGoals();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur.', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet objectif?')) return;
    try {
      await api.delete(`/savings/goals/${id}`);
      showToast('Objectif supprimé.');
      fetchGoals();
    } catch {
      showToast('Erreur lors de la suppression.', 'error');
    }
  };

  const handleAddMoney = async () => {
    const amount = parseFloat(addMoneyModal.amount);
    if (!amount || amount <= 0) {
      showToast('Montant invalide.', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.post('/savings/quick-save', {
        amount,
        goalId: addMoneyModal.goal._id,
        note: `Dépôt sur objectif "${addMoneyModal.goal.name}"`,
        disclaimerAcknowledged: true,
      });
      showToast(`${amount} DH enregistré!`);
      setAddMoneyModal({ open: false, goal: null, amount: '' });
      fetchGoals();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur.', 'error');
    }
    setSaving(false);
  };

  const getStatusBadge = (status) => {
    if (status === 'completed') return <span className="badge-green">✓ Atteint</span>;
    if (status === 'paused') return <span className="badge-yellow">⏸ En pause</span>;
    return <span className="badge-blue">▶ Actif</span>;
  };

  const categoryColors = {
    tech: '#6366F1', travel: '#F59E0B', gaming: '#10B981', eid: '#EC4899',
    emergency: '#EF4444', shopping: '#8B5CF6', other: '#64748B',
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-fini-muted text-sm">{goals.length} objectif{goals.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> Nouvel objectif
        </button>
      </div>

      {goals.length === 0 ? (
        <EmptyState icon={Target} title="Aucun objectif d'épargne"
          description="Créez votre premier objectif pour suivre votre progression vers vos achats importants."
          action={<button onClick={openCreate} className="btn-primary mx-auto">Créer un objectif</button>} />
      ) : (
        <div className="space-y-4">
          {goals.map(goal => {
            const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
            return (
              <div key={goal._id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${categoryColors[goal.category]}20` }}>
                      <Target size={18} style={{ color: categoryColors[goal.category] }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-fini-text">{goal.name}</h3>
                      {getStatusBadge(goal.status)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(goal)}
                      className="p-2 rounded-lg hover:bg-fini-border text-fini-muted hover:text-fini-text transition-all">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(goal._id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-fini-muted hover:text-red-400 transition-all">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-fini-muted">Progression</span>
                    <span className="font-bold text-fini-text" style={{ color: categoryColors[goal.category] }}>{pct}%</span>
                  </div>
                  <ProgressBar value={goal.currentAmount} max={goal.targetAmount} color={categoryColors[goal.category]} height={10} />
                  <div className="flex justify-between text-xs text-fini-muted mt-1.5">
                    <span>{goal.currentAmount.toLocaleString('fr-MA')} DH épargnés</span>
                    <span>Objectif: {goal.targetAmount.toLocaleString('fr-MA')} DH</span>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-xs text-fini-muted mb-3 italic">"{goal.description}"</p>
                )}

                {goal.status !== 'completed' && (
                  <button
                    onClick={() => setAddMoneyModal({ open: true, goal, amount: '' })}
                    className="btn-primary w-full text-sm py-2.5"
                    style={{ background: categoryColors[goal.category] }}>
                    <ArrowUp size={15} /> Ajouter une épargne
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, goal: null })}
        title={modal.goal ? 'Modifier l\'objectif' : 'Nouvel objectif d\'épargne'}>
        <div className="space-y-4">
          <div>
            <label className="label">Nom de l'objectif *</label>
            <input className="input" placeholder="ex: Nouveau smartphone"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Montant cible (DH) *</label>
            <input type="number" className="input" placeholder="ex: 3000"
              value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} min="1" />
          </div>
          <div>
            <label className="label">Catégorie</label>
            <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {[['tech', 'Technologie'], ['travel', 'Voyage'], ['gaming', 'Gaming'], ['eid', 'Aïd / Fêtes'],
                ['emergency', 'Urgences'], ['shopping', 'Shopping'], ['other', 'Autre']].map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Date cible (optionnel)</label>
            <input type="date" className="input"
              value={form.targetDate} onChange={e => setForm({ ...form, targetDate: e.target.value })} />
          </div>
          <div>
            <label className="label">Description (optionnel)</label>
            <textarea className="input" rows={2} placeholder="Pourquoi épargnez-vous?"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setModal({ open: false, goal: null })} className="btn-secondary flex-1">Annuler</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
              {saving ? 'En cours...' : modal.goal ? 'Mettre à jour' : 'Créer l\'objectif'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Money Modal */}
      <Modal isOpen={addMoneyModal.open} onClose={() => setAddMoneyModal({ open: false, goal: null, amount: '' })}
        title={`Épargner sur "${addMoneyModal.goal?.name}"`}>
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300">
            ℹ️ FINI enregistre une <strong>épargne déclarée</strong>. Cela signifie que vous confirmez avoir réellement mis ce montant de côté. FINI n'est pas une banque.
          </div>

          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 5, 10, 20].map(a => (
              <button key={a} onClick={() => setAddMoneyModal(p => ({ ...p, amount: String(a) }))}
                className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${addMoneyModal.amount === String(a) ? 'bg-fini-mint text-white border-fini-mint' : 'border-fini-border text-fini-muted hover:border-fini-mint/40'}`}>
                {a} DH
              </button>
            ))}
          </div>

          <div>
            <label className="label">Montant personnalisé (DH)</label>
            <input type="number" className="input" placeholder="Montant en DH"
              value={addMoneyModal.amount} onChange={e => setAddMoneyModal(p => ({ ...p, amount: e.target.value }))} min="0.5" />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setAddMoneyModal({ open: false, goal: null, amount: '' })} className="btn-secondary flex-1">
              Annuler
            </button>
            <button onClick={handleAddMoney} disabled={saving} className="btn-primary flex-1">
              {saving ? 'Enregistrement...' : '✓ Confirmer l\'épargne'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// === QUICK SAVE TAB ===
function QuickSaveTab() {
  const [goals, setGoals] = useState([]);
  const [amount, setAmount] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [confirmed, setConfirmed] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    api.get('/savings/goals').then(r => setGoals(r.data.goals.filter(g => g.status === 'active')));
    api.get('/savings/transactions?limit=5').then(r => setTransactions(r.data.transactions));
  }, []);

  const handleQuickSave = async () => {
    const a = parseFloat(amount);
    if (!a || a <= 0) { showToast('Montant invalide.', 'error'); return; }
    if (!confirmed) { showToast('Veuillez confirmer avoir mis de côté ce montant.', 'warning'); return; }

    setLoading(true);
    try {
      await api.post('/savings/quick-save', {
        amount: a,
        goalId: selectedGoal || undefined,
        disclaimerAcknowledged: true,
        note: selectedGoal ? undefined : 'Épargne rapide'
      });
      showToast(`${a} DH enregistré avec succès! 🎉`);
      setAmount('');
      setConfirmed(false);
      const r = await api.get('/savings/transactions?limit=5');
      setTransactions(r.data.transactions);
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur.', 'error');
    }
    setLoading(false);
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="card mb-5">
        <h3 className="font-bold text-fini-text mb-4">Enregistrer une épargne rapide</h3>

        {/* Quick amounts */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {[1, 2, 5, 10, 20].map(a => (
            <button key={a} onClick={() => setAmount(String(a))}
              className={`py-3 rounded-xl text-sm font-bold border transition-all ${amount === String(a) ? 'bg-fini-mint text-white border-fini-mint' : 'border-fini-border text-fini-muted hover:border-fini-mint/40 hover:text-fini-mint'}`}>
              {a} DH
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="label">Montant personnalisé</label>
          <div className="relative">
            <input type="number" className="input pr-12" placeholder="0.00"
              value={amount} onChange={e => setAmount(e.target.value)} min="0.5" step="0.5" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-fini-muted text-sm font-bold">DH</span>
          </div>
        </div>

        {goals.length > 0 && (
          <div className="mb-4">
            <label className="label">Associer à un objectif (optionnel)</label>
            <select className="input" value={selectedGoal} onChange={e => setSelectedGoal(e.target.value)}>
              <option value="">Épargne générale</option>
              {goals.map(g => <option key={g._id} value={g._id}>{g.name} — reste {(g.targetAmount - g.currentAmount).toLocaleString('fr-MA')} DH</option>)}
            </select>
          </div>
        )}

        <div className="flex items-start gap-3 p-4 bg-fini-border/30 rounded-xl mb-4">
          <input type="checkbox" id="confirmSave" checked={confirmed} onChange={e => setConfirmed(e.target.checked)}
            className="mt-0.5 accent-mint-500 w-4 h-4" />
          <label htmlFor="confirmSave" className="text-xs text-fini-muted cursor-pointer">
            Je confirme avoir réellement mis de côté <strong className="text-fini-text">{amount || '...'} DH</strong>. FINI enregistre une épargne déclarée. Ce montant n'est pas déposé chez FINI.
          </label>
        </div>

        <button onClick={handleQuickSave} disabled={loading || !amount || !confirmed}
          className="btn-primary w-full py-3">
          {loading ? 'Enregistrement...' : `Enregistrer ${amount ? amount + ' DH' : 'l\'épargne'}`}
        </button>
      </div>

      {/* Recent transactions */}
      {transactions.length > 0 && (
        <div>
          <h3 className="font-bold text-fini-text mb-3">Transactions récentes</h3>
          <div className="space-y-2">
            {transactions.map(tx => (
              <div key={tx._id} className="card py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-mint-500/10 rounded-lg flex items-center justify-center">
                    <PiggyBank size={16} className="text-fini-mint" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-fini-text">{tx.note || 'Épargne déclarée'}</p>
                    <p className="text-xs text-fini-muted">{tx.goal?.name || 'Général'} · {new Date(tx.createdAt).toLocaleDateString('fr-MA')}</p>
                  </div>
                </div>
                <span className="text-fini-mint font-bold text-sm">+{tx.amount} DH</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// === SAVING PLANS TAB ===
function PlansTab() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ title: '', targetFrequency: 'daily', targetAmountPerPeriod: '', description: '' });
  const [saving, setSaving] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try {
      const r = await api.get('/savings/plans');
      setPlans(r.data.plans);
    } catch {}
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!form.title || !form.targetAmountPerPeriod) {
      showToast('Titre et montant requis.', 'error'); return;
    }
    setSaving(true);
    try {
      await api.post('/savings/plans', form);
      showToast('Plan créé!');
      setModal(false);
      fetchPlans();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur.', 'error');
    }
    setSaving(false);
  };

  const handlePause = async (plan) => {
    try {
      await api.put(`/savings/plans/${plan._id}`, { status: plan.status === 'active' ? 'paused' : 'active' });
      showToast(plan.status === 'active' ? 'Plan mis en pause.' : 'Plan repris!');
      fetchPlans();
    } catch {}
  };

  const freqLabel = { daily: 'par jour', weekly: 'par semaine', monthly: 'par mois' };

  if (loading) return <PageLoader />;

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex justify-between items-center mb-4">
        <p className="text-fini-muted text-sm">{plans.length} plan{plans.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setModal(true)} className="btn-primary">
          <Plus size={16} /> Nouveau plan
        </button>
      </div>

      {plans.length === 0 ? (
        <EmptyState icon={TrendingUp} title="Aucun plan d'épargne"
          description="Choisissez un défi d'épargne flexible pour construire une habitude d'épargne régulière."
          action={<button onClick={() => setModal(true)} className="btn-primary mx-auto">Commencer un plan</button>} />
      ) : (
        <div className="space-y-4">
          {plans.map(plan => (
            <div key={plan._id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <Flame size={22} className="text-fini-purple" />
                  </div>
                  <div>
                    <h3 className="font-bold text-fini-text">{plan.title}</h3>
                    <p className="text-xs text-fini-muted mt-0.5">
                      {plan.targetAmountPerPeriod} DH {freqLabel[plan.targetFrequency]}
                    </p>
                  </div>
                </div>
                <button onClick={() => handlePause(plan)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${plan.status === 'active' ? 'badge-yellow' : 'badge-green'}`}>
                  {plan.status === 'active' ? '⏸ Pause' : '▶ Reprendre'}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-fini-border/30 rounded-xl p-3">
                  <p className="text-xl font-black text-fini-purple">🔥 {plan.currentStreak}</p>
                  <p className="text-xs text-fini-muted">Jours streak</p>
                </div>
                <div className="bg-fini-border/30 rounded-xl p-3">
                  <p className="text-xl font-black text-fini-mint">{plan.totalSaved.toLocaleString('fr-MA')}</p>
                  <p className="text-xs text-fini-muted">DH total</p>
                </div>
                <div className="bg-fini-border/30 rounded-xl p-3">
                  <p className="text-xl font-black text-fini-yellow capitalize">{freqLabel[plan.targetFrequency]?.split(' ')[1]}</p>
                  <p className="text-xs text-fini-muted">Fréquence</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Créer un plan d'épargne">
        <div className="space-y-4">
          <div>
            <label className="label">Titre du plan</label>
            <input className="input" placeholder="ex: Défi 5 DH par jour"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Montant cible</label>
            <input type="number" className="input" placeholder="ex: 5"
              value={form.targetAmountPerPeriod} onChange={e => setForm({ ...form, targetAmountPerPeriod: e.target.value })} min="1" />
          </div>
          <div>
            <label className="label">Fréquence</label>
            <select className="input" value={form.targetFrequency} onChange={e => setForm({ ...form, targetFrequency: e.target.value })}>
              <option value="daily">Chaque jour</option>
              <option value="weekly">Chaque semaine</option>
              <option value="monthly">Chaque mois</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setModal(false)} className="btn-secondary flex-1">Annuler</button>
            <button onClick={handleCreate} disabled={saving} className="btn-primary flex-1">
              {saving ? 'Création...' : 'Créer le plan'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// === MAIN SAVINGS PAGE ===
export default function SavingsPage() {
  const [tab, setTab] = useState('goals');

  const tabs = [
    { key: 'goals', label: 'Objectifs' },
    { key: 'quick', label: 'Épargne rapide' },
    { key: 'plans', label: 'Plans d\'épargne' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-fini-text">💰 Épargne</h1>
        <p className="text-fini-muted text-sm mt-1">Gérez vos objectifs et habitudes d'épargne</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-fini-card border border-fini-border rounded-xl overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`${tab === t.key ? 'tab-active' : 'tab-inactive'} whitespace-nowrap`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'goals' && <GoalsTab />}
      {tab === 'quick' && <QuickSaveTab />}
      {tab === 'plans' && <PlansTab />}
    </div>
  );
}
