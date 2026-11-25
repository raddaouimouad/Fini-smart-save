import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Toast, Modal } from '../components/UI';
import { User, Lock, Bell, Globe, Shield, LogOut, Trash2, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    city: user?.city || 'Casablanca',
    language: user?.language || 'fr',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/update-profile', profileForm);
      updateUser(res.data.user);
      showToast('Profil mis à jour avec succès.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de la mise à jour.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('Les nouveaux mots de passe ne correspondent pas.', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('Le mot de passe doit comporter au moins 6 caractères.', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      showToast('Mot de passe modifié avec succès.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Mot de passe actuel incorrect.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="page-header">
        <h1 className="text-2xl font-bold text-fini-text">👤 Mon Profil & Paramètres</h1>
        <p className="text-fini-muted text-sm mt-1">Gérez vos coordonnées, votre sécurité et vos préférences</p>
      </div>

      {/* User Summary Card */}
      <div className="card p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="w-20 h-20 rounded-2xl bg-fini-mint/20 border border-fini-mint/40 flex items-center justify-center text-fini-mint text-2xl font-black flex-shrink-0">
          {initials}
        </div>
        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-bold text-white">{user?.fullName}</h2>
            <span className="badge-purple self-center sm:self-auto uppercase text-[10px] font-bold">
              Rôle : {user?.role || 'user'}
            </span>
          </div>
          <p className="text-sm text-fini-muted mt-1">{user?.email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-fini-muted">
            <span>📞 {user?.phoneNumber}</span>
            <span>📍 {user?.city || 'Maroc'}</span>
            <span>📅 Membre depuis {new Date(user?.createdAt || Date.now()).toLocaleDateString('fr-MA', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Form */}
        <div className="card p-5">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-fini-border">
            <User size={18} className="text-fini-mint" />
            <h3 className="text-base font-bold text-white">Informations Personnelles</h3>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-3.5">
            <div>
              <label className="label">Nom complet</label>
              <input
                type="text"
                required
                className="input"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Numéro de téléphone</label>
              <input
                type="text"
                required
                className="input font-mono"
                value={profileForm.phoneNumber}
                onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Ville de résidence</label>
              <select
                className="input"
                value={profileForm.city}
                onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
              >
                {['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès', 'Agadir', 'Salé', 'Autre'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Langue de l'interface</label>
              <select
                className="input"
                value={profileForm.language}
                onChange={(e) => setProfileForm({ ...profileForm, language: e.target.value })}
              >
                <option value="fr">Français (Par défaut)</option>
                <option value="ar">العربية (Arabe - Prêt RTL)</option>
                <option value="en">English</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="btn-primary w-full mt-2"
            >
              {savingProfile ? 'Enregistrement...' : 'Mettre à jour mes informations'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="card p-5">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-fini-border">
            <Lock size={18} className="text-purple-400" />
            <h3 className="text-base font-bold text-white">Sécurité du Mot de Passe</h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3.5">
            <div>
              <label className="label">Mot de passe actuel</label>
              <input
                type="password"
                required
                className="input"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Nouveau mot de passe</label>
              <input
                type="password"
                required
                placeholder="Au moins 6 caractères"
                className="input"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                required
                className="input"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="btn-secondary w-full mt-2 font-semibold"
            >
              {savingPassword ? 'Modification...' : 'Modifier le mot de passe'}
            </button>
          </form>
        </div>
      </div>

      {/* Danger Zone & Logout */}
      <div className="card p-5 border-red-500/20">
        <h3 className="text-base font-bold text-white mb-2">Zone du Compte</h3>
        <p className="text-xs text-fini-muted mb-4">
          Vous pouvez vous déconnecter ou formuler une demande de suppression de vos données conformément à la législation sur la protection des données.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleLogout}
            className="btn-secondary text-red-400 border-red-500/30 hover:bg-red-500/10 text-xs font-bold"
          >
            <LogOut size={16} /> Se déconnecter de FINI
          </button>
          <button
            onClick={() => setDeleteModal(true)}
            className="text-xs text-fini-muted hover:text-red-400 px-3 py-2 transition-colors"
          >
            Demander la suppression de mon compte
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Demande de suppression de compte"
      >
        <div className="space-y-4">
          <p className="text-sm text-fini-muted leading-relaxed">
            Conformément à la protection des données personnelles, votre demande de suppression sera enregistrée. Votre solde de FINI Coins ainsi que vos objectifs d'épargne déclarés seront définitivement purgés.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteModal(false)}
              className="btn-secondary flex-1"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                showToast('Demande enregistrée. Notre support prendra contact.');
                setDeleteModal(false);
              }}
              className="btn-danger flex-1"
            >
              Confirmer la demande
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
