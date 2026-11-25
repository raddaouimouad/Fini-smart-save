import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 24 }) {
  return <Loader2 size={size} className="animate-spin text-fini-mint" />;
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <LoadingSpinner size={40} />
        <p className="mt-3 text-fini-muted text-sm">Chargement...</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="h-4 bg-fini-border rounded w-3/4 mb-3"></div>
      <div className="h-8 bg-fini-border rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-fini-border rounded w-full"></div>
    </div>
  );
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="card border-red-500/30 bg-red-500/10 text-center py-8">
      <p className="text-red-400 mb-3">⚠️ {message || 'Une erreur est survenue.'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-xs">Réessayer</button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="card text-center py-12">
      {Icon && (
        <div className="w-16 h-16 bg-fini-border rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon size={28} className="text-fini-muted" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-fini-text mb-2">{title}</h3>
      {description && <p className="text-fini-muted text-sm mb-5 max-w-xs mx-auto">{description}</p>}
      {action}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className={`relative bg-navy-900 border border-fini-border rounded-2xl w-full ${maxWidth} shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-5 border-b border-fini-border">
            <h2 className="text-lg font-bold text-fini-text">{title}</h2>
            <button onClick={onClose} className="text-fini-muted hover:text-white transition-colors text-xl leading-none">×</button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Toast({ message, type = 'success', onClose }) {
  const colors = {
    success: 'bg-mint-500/20 border-mint-500/40 text-mint-400',
    error: 'bg-red-500/20 border-red-500/40 text-red-400',
    info: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
    warning: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400',
  };
  return (
    <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl animate-slide-up ${colors[type]}`}>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100">×</button>
    </div>
  );
}

export function ProgressBar({ value, max, color = '#10B981', height = 8 }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="progress-bar-bg" style={{ height }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

export function CoinsBadge({ amount, size = 'sm' }) {
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl font-bold' };
  return (
    <span className={`inline-flex items-center gap-1 text-fini-yellow font-semibold ${sizes[size]}`}>
      🪙 {amount?.toLocaleString('fr-MA')}
    </span>
  );
}

export function PriceBadge({ amount, size = 'sm' }) {
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl font-bold' };
  return (
    <span className={`text-fini-mint font-semibold ${sizes[size]}`}>
      {amount?.toLocaleString('fr-MA')} DH
    </span>
  );
}
