import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { PageLoader, EmptyState, Modal, Toast } from '../components/UI';
import { Store, MapPin, Tag, Award, Search, QrCode, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

export default function PartnersPage() {
  const { user, updateUser } = useAuth();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [partnerDetails, setPartnerDetails] = useState(null);
  const [detailsModal, setDetailsModal] = useState(false);
  const [simulateModal, setSimulateModal] = useState(false);
  const [simForm, setSimForm] = useState({ partnerId: '', amountMAD: '', receiptNo: '' });
  const [simulating, setSimulating] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchPartners();
  }, [category, search]);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);
      if (search) params.append('search', search);
      const res = await api.get(`/partners?${params.toString()}`);
      setPartners(res.data.partners || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = async (partner) => {
    setSelectedPartner(partner);
    setDetailsModal(true);
    try {
      const res = await api.get(`/partners/${partner._id}`);
      setPartnerDetails(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulatePurchase = async (e) => {
    e.preventDefault();
    const amount = parseFloat(simForm.amountMAD);
    if (!simForm.partnerId || !amount || amount <= 0) {
      showToast('Veuillez sélectionner un partenaire et entrer un montant valide.', 'error');
      return;
    }

    setSimulating(true);
    try {
      // Find partner earning rate
      const p = partners.find(item => item._id === simForm.partnerId);
      const coinsEarned = Math.max(1, Math.round(amount * (p?.coinsPerMAD || 0.1)));

      // Simulate a verified POS transaction via quick save or coin adjustment
      // We credit coins via demo partner transaction
      showToast(`Achat vérifié de ${amount} DH ! +${coinsEarned} FINI Coins crédités. 🎉`);
      updateUser({ coinsBalance: (user?.coinsBalance || 0) + coinsEarned });
      setSimulateModal(false);
      setSimForm({ partnerId: '', amountMAD: '', receiptNo: '' });
    } catch (err) {
      showToast('Erreur de simulation.', 'error');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fini-text">🏬 Réseau Partenaires FINI</h1>
          <p className="text-fini-muted text-sm mt-1">Découvrez les enseignes participantes et les opportunités de récompenses</p>
        </div>
        <button
          onClick={() => setSimulateModal(true)}
          className="btn-primary self-start sm:self-auto bg-purple-600 hover:bg-purple-700 text-white font-bold"
        >
          <QrCode size={16} /> Simuler un achat vérifié (Démo)
        </button>
      </div>

      {/* Potential Partners Transparency Disclaimer */}
      <div className="card bg-blue-950/20 border-blue-500/30 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-200/90 leading-relaxed">
            <strong className="font-semibold text-blue-300">Note de transparence :</strong> Les marques présentées ci-dessous (BIM, Marjane Market, Kazyon, etc.) représentent des enseignes cibles et des partenariats potentiels dans le cadre de notre projet pilote. Elles ne constituent pas des partenariats commerciaux officiellement signés.
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fini-muted" />
          <input
            type="text"
            placeholder="Rechercher un partenaire par nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'Tous' },
            { id: 'supermarket', label: 'Supermarchés' },
            { id: 'gaming', label: 'Gaming' },
            { id: 'food', label: 'Restauration' },
            { id: 'electronics', label: 'Électronique' },
          ].map((cat) => (
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

      {/* Partners List */}
      {loading ? (
        <PageLoader />
      ) : partners.length === 0 ? (
        <EmptyState
          icon={Store}
          title="Aucun partenaire trouvé"
          description="Aucune enseigne ne correspond à vos critères de recherche."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((partner) => (
            <div
              key={partner._id}
              className="card flex flex-col justify-between hover:border-fini-mint/40 transition-all p-5"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-navy-950 border border-fini-border flex items-center justify-center font-black text-fini-mint text-base">
                      {partner.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{partner.name}</h3>
                      <span className="badge-purple text-[10px] uppercase font-semibold">
                        {partner.category}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-fini-muted mt-3 line-clamp-2 leading-relaxed">
                  {partner.description}
                </p>

                <div className="mt-4 pt-3 border-t border-fini-border space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-yellow-400 font-medium">
                    <Award size={14} />
                    <span>{partner.earningRateDescription}</span>
                  </div>

                  {partner.cities && partner.cities.length > 0 && (
                    <div className="flex items-center gap-1.5 text-fini-muted">
                      <MapPin size={14} className="text-fini-muted" />
                      <span>{partner.cities.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-fini-border flex items-center justify-between">
                <span className="text-[11px] font-semibold text-mint-400">
                  {partner.activeCampaignCount} campagne(s) active(s)
                </span>
                <button
                  onClick={() => handleOpenDetails(partner)}
                  className="btn-secondary text-xs font-semibold py-1.5 px-3"
                >
                  Voir détails & offres
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Partner Details Modal */}
      <Modal
        isOpen={detailsModal}
        onClose={() => { setDetailsModal(false); setPartnerDetails(null); }}
        title={selectedPartner ? selectedPartner.name : 'Détails du partenaire'}
      >
        {selectedPartner && (
          <div className="space-y-4">
            <p className="text-xs text-fini-muted leading-relaxed">{selectedPartner.description}</p>

            <div className="p-3 bg-navy-950 rounded-xl border border-fini-border">
              <span className="text-xs text-fini-muted uppercase font-bold">Règle de récompense :</span>
              <p className="text-sm font-bold text-yellow-400 mt-1">{selectedPartner.earningRateDescription}</p>
            </div>

            {partnerDetails?.branches && partnerDetails.branches.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-fini-text mb-2">Points de vente & Villes</h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {partnerDetails.branches.map((b, idx) => (
                    <div key={idx} className="p-2 bg-navy-950/60 rounded-lg text-xs flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-white">{b.name}</p>
                        <p className="text-[11px] text-fini-muted">{b.address} ({b.city})</p>
                      </div>
                      <span className="text-[10px] text-mint-400">{b.openingHours}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setDetailsModal(false);
                setSimForm(p => ({ ...p, partnerId: selectedPartner._id }));
                setSimulateModal(true);
              }}
              className="btn-primary w-full bg-purple-600 hover:bg-purple-700 text-white font-bold mt-2"
            >
              Simuler un achat chez {selectedPartner.name}
            </button>
          </div>
        )}
      </Modal>

      {/* Verified Purchase Simulator Modal */}
      <Modal
        isOpen={simulateModal}
        onClose={() => setSimulateModal(false)}
        title="Simulateur d'Achat Vérifié en Caisse (Démo)"
      >
        <form onSubmit={handleSimulatePurchase} className="space-y-4">
          <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl text-xs text-purple-200">
            Cet outil simule le flux où un client présente son QR code FINI ou numéro de téléphone lors d'un passage en caisse POS chez un marchand partenaire.
          </div>

          <div>
            <label className="label">Enseigne partenaire *</label>
            <select
              required
              className="input"
              value={simForm.partnerId}
              onChange={(e) => setSimForm({ ...simForm, partnerId: e.target.value })}
            >
              <option value="">Sélectionnez un partenaire</option>
              {partners.map(p => (
                <option key={p._id} value={p._id}>{p.name} ({p.earningRateDescription})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Montant de l'achat en Dirhams (DH) *</label>
            <input
              type="number"
              required
              min="1"
              step="1"
              placeholder="Ex: 150"
              className="input"
              value={simForm.amountMAD}
              onChange={(e) => setSimForm({ ...simForm, amountMAD: e.target.value })}
            />
          </div>

          <div>
            <label className="label">N° de ticket de caisse (Simulé)</label>
            <input
              type="text"
              placeholder="Ex: TCK-2026-88912"
              className="input font-mono"
              value={simForm.receiptNo}
              onChange={(e) => setSimForm({ ...simForm, receiptNo: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSimulateModal(false)}
              className="btn-secondary flex-1"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={simulating}
              className="btn-primary flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
              {simulating ? 'Vérification POS...' : '✓ Valider la transaction'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
