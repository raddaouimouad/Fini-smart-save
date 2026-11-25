import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { PageLoader, EmptyState, Toast } from '../../components/UI';
import { Users, Search, Shield, Ban, CheckCircle, RefreshCw } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchUsers();
  }, [search, role]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (role) params.append('role', role);
      const res = await api.get(`/admin/users?${params.toString()}`);
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSuspend = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/suspend`);
      showToast(res.data.message);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isSuspended: res.data.user.isSuspended } : u));
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de la mise à jour.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion des Utilisateurs</h1>
          <p className="text-xs text-fini-muted mt-0.5">Consultez, recherchez et modérez les comptes de la plateforme</p>
        </div>
        <button
          onClick={fetchUsers}
          className="btn-secondary self-start sm:self-auto text-xs py-2 px-3 flex items-center gap-1.5"
        >
          <RefreshCw size={14} /> Rafraîchir
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fini-muted" />
          <input
            type="text"
            placeholder="Rechercher par nom ou adresse email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 text-xs"
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="input sm:w-48 text-xs"
        >
          <option value="">Tous les rôles</option>
          <option value="user">Utilisateurs</option>
          <option value="admin">Administrateurs</option>
          <option value="merchant">Marchands</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <PageLoader />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun utilisateur trouvé"
          description="Aucun compte ne correspond à votre recherche actuelle."
        />
      ) : (
        <div className="card p-0 overflow-hidden border-fini-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-950 border-b border-fini-border text-fini-muted uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="p-3.5 pl-4">Utilisateur</th>
                  <th className="p-3.5">Téléphone</th>
                  <th className="p-3.5">Rôle</th>
                  <th className="p-3.5">Solde Coins</th>
                  <th className="p-3.5">Statut</th>
                  <th className="p-3.5">Inscrit le</th>
                  <th className="p-3.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fini-border">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-fini-card-hover/50 transition-colors">
                    <td className="p-3.5 pl-4">
                      <div>
                        <p className="font-bold text-white">{u.fullName}</p>
                        <p className="text-[11px] text-fini-muted font-mono">{u.email}</p>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-fini-text">{u.phoneNumber || '—'}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'badge-purple' : u.role === 'merchant' ? 'badge-yellow' : 'badge-blue'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-yellow-400">
                      🪙 {(u.coinsBalance || 0).toLocaleString('fr-MA')}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.isSuspended ? 'badge-red' : 'badge-green'
                      }`}>
                        {u.isSuspended ? 'Suspendu' : 'Actif'}
                      </span>
                    </td>
                    <td className="p-3.5 text-fini-muted">
                      {new Date(u.createdAt).toLocaleDateString('fr-MA')}
                    </td>
                    <td className="p-3.5 pr-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleSuspend(u._id)}
                          className={`text-[11px] font-bold py-1 px-2.5 rounded-lg border transition-all ${
                            u.isSuspended
                              ? 'border-mint-500/30 text-mint-400 hover:bg-mint-500/10'
                              : 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                          }`}
                        >
                          {u.isSuspended ? 'Réactiver' : 'Suspendre'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
