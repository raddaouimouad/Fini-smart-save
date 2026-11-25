import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { PageLoader, EmptyState } from '../../components/UI';
import { FileText, Shield, Clock, Search } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-log');
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Journal d'Audit de Sécurité</h1>
        <p className="text-xs text-fini-muted mt-0.5">Historique complet et infalsifiable des actions administratives</p>
      </div>

      {loading ? (
        <PageLoader />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucun journal d'audit"
          description="Les actions administratives (créations de coupons, suspensions d'utilisateurs, ajustements de solde) apparaîtront ici."
        />
      ) : (
        <div className="card p-0 overflow-hidden border-fini-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-950 border-b border-fini-border text-fini-muted uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="p-3.5 pl-4">Date & Heure</th>
                  <th className="p-3.5">Administrateur</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Type Cible</th>
                  <th className="p-3.5 pr-4">Détails de l'opération</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fini-border font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-fini-card-hover/50 transition-colors">
                    <td className="p-3.5 pl-4 text-fini-muted whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('fr-MA', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </td>
                    <td className="p-3.5 text-white font-sans font-semibold">
                      {log.admin?.fullName || 'Admin'}
                      <span className="block text-[10px] text-fini-muted font-mono">{log.admin?.email}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="badge-purple font-bold text-[10px] uppercase">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 uppercase text-fini-text">{log.targetType}</td>
                    <td className="p-3.5 pr-4 text-fini-muted max-w-xs truncate">
                      {JSON.stringify(log.details)}
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
