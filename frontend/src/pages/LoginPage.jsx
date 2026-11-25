import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { LoadingSpinner } from '../components/UI';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-fini-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-fini-mint/20 rounded-2xl mb-4">
            <Zap size={32} className="text-fini-mint" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">FINI</h1>
          <p className="text-fini-muted mt-1">Save. Play. Shop. Get rewarded.</p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="text-xl font-bold text-fini-text mb-6">Connexion</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Adresse email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                className="input"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Votre mot de passe"
                  className="input pr-11"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fini-muted hover:text-fini-text">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? <LoadingSpinner size={18} /> : null}
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-fini-border text-center">
            <p className="text-fini-muted text-sm">
              Pas encore de compte?{' '}
              <Link to="/register" className="text-fini-mint hover:underline font-medium">
                Créer un compte
              </Link>
            </p>
          </div>

          {/* Demo Credentials Hint */}
          <div className="mt-4 p-3 bg-fini-yellow/5 border border-fini-yellow/20 rounded-xl">
            <p className="text-xs text-fini-yellow font-medium mb-1">🧪 Données de démonstration:</p>
            <p className="text-xs text-fini-muted">User: <span className="text-fini-text font-mono">demo@fini.ma</span> / Demo2024!</p>
            <p className="text-xs text-fini-muted">Admin: <span className="text-fini-text font-mono">admin@fini.ma</span> / Admin2024!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
