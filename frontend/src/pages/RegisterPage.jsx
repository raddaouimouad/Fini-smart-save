import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Zap, Check } from 'lucide-react';
import { LoadingSpinner } from '../components/UI';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.phoneNumber || !form.password || !form.confirmPassword) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-fini-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-fini-mint/20 rounded-2xl mb-4">
            <Zap size={32} className="text-fini-mint" />
          </div>
          <h1 className="text-3xl font-black text-white">FINI</h1>
          <p className="text-fini-muted mt-1">Créez votre compte gratuit</p>
        </div>

        {/* Benefits */}
        <div className="flex gap-4 mb-6 justify-center flex-wrap">
          {['50 Coins offerts', 'Épargne libre', 'Récompenses exclusives'].map(b => (
            <div key={b} className="flex items-center gap-1.5 text-xs text-fini-mint font-medium">
              <Check size={12} />
              {b}
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-fini-text mb-6">Créer un compte</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nom complet</label>
              <input name="fullName" value={form.fullName} onChange={handleChange}
                placeholder="Prénom Nom" className="input" autoComplete="name" />
            </div>

            <div>
              <label className="label">Adresse email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="votre@email.com" className="input" autoComplete="email" />
            </div>

            <div>
              <label className="label">Téléphone (Maroc)</label>
              <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange}
                placeholder="+212 6XX XXX XXX" className="input" autoComplete="tel" />
              <p className="text-xs text-fini-muted mt-1">Format: +2126XXXXXXXX ou 06XXXXXXXX</p>
            </div>

            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} name="password"
                  value={form.password} onChange={handleChange}
                  placeholder="Min. 6 caractères" className="input pr-11" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fini-muted">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Confirmer le mot de passe</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword}
                onChange={handleChange} placeholder="Répétez le mot de passe" className="input" />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? <LoadingSpinner size={18} /> : null}
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>

            <p className="text-xs text-fini-muted text-center">
              En créant un compte, vous acceptez nos conditions d'utilisation. FINI n'est pas une banque.
            </p>
          </form>

          <div className="mt-5 pt-5 border-t border-fini-border text-center">
            <p className="text-fini-muted text-sm">
              Déjà un compte?{' '}
              <Link to="/login" className="text-fini-mint hover:underline font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
