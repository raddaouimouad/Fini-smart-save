import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, PiggyBank, Gamepad2, Tag, Store, ShieldCheck, ArrowRight,
  Sparkles, CheckCircle2, ChevronRight, Award, Flame
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-fini-navy text-fini-text flex flex-col">
      {/* Navbar */}
      <header className="border-b border-fini-border bg-navy-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-fini-mint rounded-xl flex items-center justify-center shadow-lg shadow-mint-500/20">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tight">FINI</span>
              <span className="text-[10px] text-fini-mint font-bold uppercase ml-1.5 px-1.5 py-0.5 bg-mint-500/10 rounded">Maroc</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-fini-muted hover:text-white px-3 py-2 transition-colors">
              Connexion
            </Link>
            <Link to="/register" className="btn-primary text-xs font-bold py-2.5 px-4 bg-fini-mint hover:bg-mint-600">
              Ouvrir un compte
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-500/10 border border-mint-500/20 text-fini-mint text-xs font-semibold">
            <Sparkles size={14} /> La 1ère Super-App d'Épargne & Récompenses au Maroc
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Save. Play. Shop. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fini-mint via-teal-300 to-purple-400">
              Get rewarded.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-fini-muted leading-relaxed">
            Épargnez selon vos habitudes en Dirhams, rechargez vos jeux vidéo préférés et gagnez des <strong>FINI Coins</strong> universels à échanger contre des bons de réduction dans vos supermarchés et commerces locaux.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link to="/register" className="btn-primary w-full sm:w-auto text-sm font-bold py-3.5 px-8 text-base shadow-xl shadow-mint-500/20">
              Commencer gratuitement (50 Coins offerts) <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary w-full sm:w-auto text-sm font-semibold py-3.5 px-6">
              Tester le compte démo
            </Link>
          </div>

          {/* Quick Pillars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-12 max-w-4xl mx-auto">
            {[
              { icon: PiggyBank, title: 'Épargne Déclarée', desc: 'Objectifs & épargne rapide dès 1 DH' },
              { icon: Gamepad2, title: 'Gaming Store', desc: 'PUBG UC, Free Fire en DH marocains' },
              { icon: Award, title: 'FINI Coins', desc: 'Points universels multi-enseignes' },
              { icon: Tag, title: 'Bons & Coupons', desc: 'Réductions BIM, Marjane et plus' },
            ].map((col, idx) => (
              <div key={idx} className="card p-4 text-left border-fini-border/60 hover:border-fini-mint/30 transition-all">
                <col.icon size={22} className="text-fini-mint mb-2.5" />
                <h3 className="text-sm font-bold text-white">{col.title}</h3>
                <p className="text-xs text-fini-muted mt-1 leading-snug">{col.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Deep Dive */}
      <section className="py-16 bg-navy-950/60 border-y border-fini-border px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Pillar 1: Savings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="badge-green text-xs font-bold uppercase">FINI Savings</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Mettez de côté à votre rythme, sans pression bancaire
              </h2>
              <p className="text-sm text-fini-muted leading-relaxed">
                Créez des objectifs personnalisés (Aïd, Voyage, Nouveau PC) et validez vos économies réelles grâce au <strong>Quick Save</strong> : 1, 2, 5, 10 ou 20 DH d'un simple clic.
              </p>
              <ul className="space-y-2 text-xs text-fini-text">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-fini-mint" /> Objectifs avec suivi de progression en pourcentage
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-fini-mint" /> Défis intelligents flexibles (ex: 5 DH par jour)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-fini-mint" /> Aucune obligation de salaire fixe ou de compte bancaire
                </li>
              </ul>
            </div>
            <div className="card p-6 bg-navy-900 border-fini-mint/20 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-sm">Objectif : Nouveau Smartphone</span>
                <span className="text-fini-mint font-bold text-sm">65%</span>
              </div>
              <div className="w-full bg-navy-950 h-3 rounded-full overflow-hidden">
                <div className="bg-fini-mint h-full rounded-full w-[65%]" />
              </div>
              <div className="flex justify-between text-xs text-fini-muted">
                <span>2 275 DH épargnés</span>
                <span>Cible : 3 500 DH</span>
              </div>
              <div className="grid grid-cols-5 gap-2 pt-2">
                {[1, 2, 5, 10, 20].map(a => (
                  <div key={a} className="p-2 text-center bg-navy-950 rounded-lg text-xs font-bold text-fini-mint border border-fini-border">
                    +{a} DH
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pillar 2: Cross-Merchant Coins */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center md:flex-row-reverse">
            <div className="order-2 md:order-1 card p-6 bg-purple-950/20 border-purple-500/30 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl">
                  🪙
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Fidélité Universelle</h4>
                  <p className="text-xs text-purple-300">Gagnez chez BIM ➔ Dépensez chez Marjane</p>
                </div>
              </div>
              <div className="p-4 bg-navy-950/70 rounded-xl border border-fini-border text-xs text-fini-muted space-y-2">
                <p>1. Vous faites vos courses et scannez votre QR code FINI</p>
                <p>2. Vous recevez des <strong>FINI Coins</strong> vérifiés</p>
                <p>3. Vous échangez vos Coins contre des bons de réduction au choix !</p>
              </div>
            </div>

            <div className="order-1 md:order-2 space-y-4">
              <span className="badge-purple text-xs font-bold uppercase">FINI Rewards</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Un seul programme de fidélité pour toutes vos enseignes
              </h2>
              <p className="text-sm text-fini-muted leading-relaxed">
                Fini les dizaines de cartes de fidélité encombrantes. Les FINI Coins sont inter-marchands et vous récompensent à chaque achat vérifié chez nos partenaires.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Credentials Section */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto card p-6 text-center border-yellow-500/30 bg-yellow-500/5">
          <h3 className="text-lg font-bold text-yellow-400 mb-2">Comptes de Démonstration Inclus</h3>
          <p className="text-xs text-fini-muted mb-4">
            Testez l'application immédiatement avec les profils pré-configurés :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="p-3 bg-navy-950 rounded-xl border border-fini-border text-xs">
              <p className="font-bold text-fini-mint mb-1">Compte Utilisateur (Youssef)</p>
              <p className="text-fini-muted">Email : <strong className="text-white font-mono">demo@fini.ma</strong></p>
              <p className="text-fini-muted">Mot de passe : <strong className="text-white font-mono">Demo2024!</strong></p>
            </div>
            <div className="p-3 bg-navy-950 rounded-xl border border-fini-border text-xs">
              <p className="font-bold text-purple-400 mb-1">Compte Administrateur</p>
              <p className="text-fini-muted">Email : <strong className="text-white font-mono">admin@fini.ma</strong></p>
              <p className="text-fini-muted">Mot de passe : <strong className="text-white font-mono">Admin2024!</strong></p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/login" className="btn-primary inline-flex text-xs font-bold py-2 px-6">
              Accéder à la plateforme <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-fini-border py-8 px-4 sm:px-6 bg-navy-950 text-xs text-fini-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-bold text-white">FINI — Save. Play. Shop. Get rewarded.</p>
            <p className="mt-1">Plateforme technologique marocaine. FINI n'est pas un établissement de crédit ni une banque.</p>
          </div>
          <p>© 2026 FINI. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
