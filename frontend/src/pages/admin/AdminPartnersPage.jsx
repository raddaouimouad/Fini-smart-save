import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { PageLoader, EmptyState, Modal, Toast } from '../../components/UI';
import { Store, Plus, MapPin, Award, Pencil } from 'lucide-react';

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    category: 'supermarket',
    description: '',
    cities: 'Casablanca, Rabat, Marrakech',
    earningRateDescription: "1 FINI Coin pour chaque 10 DH d'achat",
    coinsPerMAD: '0.1',
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/partners');
      setPartners(res.data.partners || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePartner = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        cities: form.cities.split(',').map(c => c.trim()),
        coinsPerMAD: parseFloat(form.coinsPerMAD),
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
      };
      await api.post('/admin/partners', payload);
      showToast('Nouveau partenaire ajouté.');
      setModal(false);
      fetchPartners();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de la création.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion des Partenaires Commerciaux</h1>
          <p className="text-xs text-fini-muted mt-0.5">Configurez les enseignes, les règles de distribution de Coins et les magasins</p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="btn-primary self-start sm:self-auto bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2 px-3.5 flex items-center gap-1.5"
        >
          <Plus size={16} /> Ajouter une enseigne
        </button>
      </div>

      {loading ? (
        <PageLoader />
      ) : partners.length === 0 ? (
        <EmptyState
          icon={Store}
          title="Aucun partenaire enregistré"
          description="Ajoutez vos enseignes partenaires pour permettre aux utilisateurs d'accumuler des Coins."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((p) => (
            <div key={p._id} className="card p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-fini-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-sm">
                      {p.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{p.name}</h3>
                      <span className="badge-purple text-[10px] uppercase font-semibold">{p.category}</span>
                    </div>
                  </div>
                  <span className="badge-green text-[10px]">Actif</span>
                </div>

                <p className="text-xs text-fini-muted mt-2.5 line-clamp-2">{p.description}</p>

                <div className="mt-3 pt-3 border-t border-fini-border space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-yellow-400 font-medium">
                    <Award size={13} />
                    <span>{p.earningRateDescription}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-fini-muted">
                    <MapPin size={13} />
                    <span>{p.cities?.join(', ') || 'Maroc'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-fini-border text-xs text-fini-muted flex justify-between">
                <span>Campagnes : {p.activeCampaignCount || 0}</span>
                <span className="font-mono text-[11px] text-purple-300">Taux: {p.coinsPerMAD} C/DH</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Partner Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Ajouter une enseigne partenaire">
        <form onSubmit={handleCreatePartner} className="space-y-3.5">
          <div>
            <label className="label">Nom de l'enseigne *</label>
            <input
              type="text"
              required
              placeholder="ex: Carrefour Market"
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Catégorie</label>
              <select
                className="input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="supermarket">Supermarché</option>
                <option value="retail">Commerce de détail</option>
                <option value="food">Restauration</option>
                <option value="electronics">Électronique</option>
                <option value="gaming">Gaming</option>
              </select>
            </div>
            <div>
              <label className="label">Coins par Dirham dépensé</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="ex: 0.1 (1 coin pour 10 DH)"
                className="input"
                value={form.coinsPerMAD}
                onChange={(e) => setForm({ ...form, coinsPerMAD: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">Description de la règle pour l'utilisateur</label>
            <input
              type="text"
              required
              placeholder="ex: 1 FINI Coin pour chaque 10 DH d'achat vérifié"
              className="input"
              value={form.earningRateDescription}
              onChange={(e) => setForm({ ...form, earningRateDescription: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Villes de présence (séparées par une virgule)</label>
            <input
              type="text"
              placeholder="Casablanca, Rabat, Marrakech"
              className="input"
              value={form.cities}
              onChange={(e) => setForm({ ...form, cities: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              rows={2}
              placeholder="Présentation de l'enseigne"
              className="input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModal(false)}
              className="btn-secondary flex-1"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
              {submitting ? 'Création...' : 'Créer l\'enseigne'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
