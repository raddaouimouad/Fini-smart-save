require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const SavingGoal = require('../models/SavingGoal');
const SavingTransaction = require('../models/SavingTransaction');
const SavingPlan = require('../models/SavingPlan');
const CoinTransaction = require('../models/CoinTransaction');
const Coupon = require('../models/Coupon');
const CouponRedemption = require('../models/CouponRedemption');
const GamingProduct = require('../models/GamingProduct');
const GamingOrder = require('../models/GamingOrder');
const Partner = require('../models/Partner');
const PartnerBranch = require('../models/PartnerBranch');
const PartnerCampaign = require('../models/PartnerCampaign');
const Notification = require('../models/Notification');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/fini_db';

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[SEED] MongoDB connected');

    await Promise.all([
      User.deleteMany({}),
      SavingGoal.deleteMany({}),
      SavingTransaction.deleteMany({}),
      SavingPlan.deleteMany({}),
      CoinTransaction.deleteMany({}),
      Coupon.deleteMany({}),
      CouponRedemption.deleteMany({}),
      GamingProduct.deleteMany({}),
      GamingOrder.deleteMany({}),
      Partner.deleteMany({}),
      PartnerBranch.deleteMany({}),
      PartnerCampaign.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('[SEED] Database cleared');

    // ===== USERS =====
    // Note: passwords are auto-hashed by User pre-save hook
    const admin = await User.create({
      fullName: 'Admin FINI',
      email: 'admin@fini.ma',
      phoneNumber: '+212600000001',
      password: 'Admin2024!',
      role: 'admin',
      coinsBalance: 9999,
    });

    const demo = await User.create({
      fullName: 'Youssef El Mansouri',
      email: 'demo@fini.ma',
      phoneNumber: '+212612345678',
      password: 'Demo2024!',
      role: 'user',
      coinsBalance: 1250,
      city: 'Casablanca',
    });

    const user2 = await User.create({
      fullName: 'Fatima Zahra Alaoui',
      email: 'fatima@fini.ma',
      phoneNumber: '+212698765432',
      password: 'Demo2024!',
      role: 'user',
      coinsBalance: 530,
      city: 'Rabat',
    });

    console.log('[SEED] Users created');
    console.log(`  Admin: admin@fini.ma / Admin2024!`);
    console.log(`  Demo:  demo@fini.ma / Demo2024!`);

    // ===== PARTNERS (Potential, not confirmed agreements) =====
    const bim = await Partner.create({
      name: 'BIM',
      slug: 'bim',
      category: 'supermarket',
      description: 'Chaîne de supermarchés à prix discount présente à travers tout le Maroc. [Partenariat potentiel - non confirmé]',
      cities: ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès'],
      earningRateDescription: '1 FINI Coin pour chaque 10 DH d\'achat vérifié',
      coinsPerMAD: 0.1,
      activeCampaignCount: 2,
      status: 'active',
      isVerifiedPartner: false,
    });

    const marjane = await Partner.create({
      name: 'Marjane Market',
      slug: 'marjane',
      category: 'supermarket',
      description: 'Hypermarché marocain avec un large choix de produits alimentaires et non-alimentaires. [Partenariat potentiel - non confirmé]',
      cities: ['Casablanca', 'Rabat', 'Fès', 'Marrakech'],
      earningRateDescription: '2 FINI Coins pour chaque 10 DH d\'achat vérifié',
      coinsPerMAD: 0.2,
      activeCampaignCount: 1,
      status: 'active',
      isVerifiedPartner: false,
    });

    const kazyon = await Partner.create({
      name: 'Kazyon',
      slug: 'kazyon',
      category: 'supermarket',
      description: 'Supermarché discount offrant des produits de grande consommation à prix réduit. [Partenariat potentiel - non confirmé]',
      cities: ['Casablanca', 'Salé', 'Kenitra'],
      earningRateDescription: '1 FINI Coin pour chaque 10 DH d\'achat vérifié',
      coinsPerMAD: 0.1,
      activeCampaignCount: 1,
      status: 'active',
      isVerifiedPartner: false,
    });

    const finiGaming = await Partner.create({
      name: 'FINI Gaming Store',
      slug: 'fini-gaming',
      category: 'gaming',
      description: 'Votre destination gaming au Maroc pour les crédits et cartes-cadeaux digitaux.',
      cities: ['Maroc entier'],
      earningRateDescription: 'Coins bonus inclus dans chaque achat',
      coinsPerMAD: 0.5,
      activeCampaignCount: 1,
      status: 'active',
      isVerifiedPartner: true,
    });

    console.log('[SEED] Partners created (demo only - no confirmed agreements)');

    // ===== PARTNER BRANCHES =====
    await PartnerBranch.insertMany([
      { partner: bim._id, name: 'BIM Casablanca Ain Diab', city: 'Casablanca', address: 'Bd de l\'Océan, Ain Diab', openingHours: '08:00 - 22:00' },
      { partner: bim._id, name: 'BIM Rabat Agdal', city: 'Rabat', address: 'Rue Moulay Youssef, Agdal', openingHours: '08:00 - 22:00' },
      { partner: marjane._id, name: 'Marjane Casablanca Maarif', city: 'Casablanca', address: 'Bd Abdelmoumen, Maarif', openingHours: '09:00 - 22:30' },
      { partner: marjane._id, name: 'Marjane Rabat Sale', city: 'Rabat', address: 'Route de Meknes, Rabat', openingHours: '09:00 - 22:30' },
      { partner: kazyon._id, name: 'Kazyon Casablanca', city: 'Casablanca', address: 'Hay Mohammadi, Casablanca', openingHours: '08:00 - 21:00' },
    ]);

    // ===== PARTNER CAMPAIGNS =====
    const campaign1 = await PartnerCampaign.create({
      partner: bim._id,
      title: 'Double Coins Weekend BIM - Demo',
      description: 'Campagne démo: Double vos FINI Coins ce weekend lors de vos achats BIM (simulation).',
      campaignType: 'double_coins',
      status: 'active',
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      totalCoinsBudget: 10000,
      minPurchaseMAD: 50,
      maxRedemptionsTotal: 500,
    });

    const campaign2 = await PartnerCampaign.create({
      partner: marjane._id,
      title: 'Marjane Ramadan Coins - Demo',
      description: 'Campagne démo: Gagnez 3x Coins pendant Ramadan chez Marjane (simulation).',
      campaignType: 'earn_coins',
      status: 'active',
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      totalCoinsBudget: 25000,
      minPurchaseMAD: 100,
      maxRedemptionsTotal: 1000,
    });

    console.log('[SEED] Campaigns created');

    // ===== COUPONS =====
    const coupon1 = await Coupon.create({
      title: '10 DH de réduction chez BIM',
      code: 'FINI-BIM-10DH',
      merchantName: 'BIM',
      partner: bim._id,
      category: 'supermarket',
      discountType: 'fixed_amount',
      discountValue: 10,
      requiredCoins: 100,
      minPurchaseAmount: 80,
      expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      termsAndConditions: ['Valable chez BIM uniquement', 'Achat minimum de 80 DH', 'Non cumulable avec d\'autres offres', 'Données de démonstration'],
      maxRedemptions: 1000,
      campaignBudgetCoins: 100000,
    });

    const coupon2 = await Coupon.create({
      title: '15% de réduction chez Marjane',
      code: 'FINI-MRJ-15PCT',
      merchantName: 'Marjane Market',
      partner: marjane._id,
      category: 'supermarket',
      discountType: 'percentage',
      discountValue: 15,
      requiredCoins: 200,
      minPurchaseAmount: 150,
      maxDiscountAmount: 50,
      expirationDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      termsAndConditions: ['Valable chez Marjane uniquement', 'Achat minimum de 150 DH', 'Remise maximum de 50 DH', 'Données de démonstration'],
      maxRedemptions: 500,
      campaignBudgetCoins: 50000,
    });

    const coupon3 = await Coupon.create({
      title: '20 DH de réduction Gaming',
      code: 'FINI-GAME-20DH',
      merchantName: 'FINI Gaming Store',
      partner: finiGaming._id,
      category: 'gaming',
      discountType: 'fixed_amount',
      discountValue: 20,
      requiredCoins: 150,
      minPurchaseAmount: 60,
      expirationDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      termsAndConditions: ['Valable sur le FINI Gaming Store', 'Achat minimum de 60 DH'],
      maxRedemptions: 300,
      campaignBudgetCoins: 45000,
    });

    const coupon4 = await Coupon.create({
      title: '5 DH de bienvenue chez Kazyon',
      code: 'FINI-KAZ-5DH',
      merchantName: 'Kazyon',
      partner: kazyon._id,
      category: 'supermarket',
      discountType: 'fixed_amount',
      discountValue: 5,
      requiredCoins: 50,
      minPurchaseAmount: 40,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      termsAndConditions: ['Valable chez Kazyon uniquement', 'Achat minimum de 40 DH', 'Données de démonstration'],
      maxRedemptions: 2000,
      campaignBudgetCoins: 100000,
    });

    console.log('[SEED] Coupons created');

    // ===== GAMING PRODUCTS =====
    const pubg = await GamingProduct.create({
      name: 'PUBG Mobile UC',
      gameTitle: 'PUBG Mobile',
      category: 'pubg',
      description: 'Achetez des Unknown Cash (UC) pour PUBG Mobile. Utilisez vos UC pour des skins, royales passes et plus encore.',
      accountInputLabel: 'Votre Player ID PUBG',
      accountInputPlaceholder: 'Ex: 5132456789',
      isAvailable: true,
      packages: [
        { packageName: '60 UC', priceMAD: 12, bonusCoins: 5, inStock: true },
        { packageName: '325 UC', priceMAD: 60, bonusCoins: 25, inStock: true, badge: 'Populaire' },
        { packageName: '660 UC', priceMAD: 118, bonusCoins: 50, inStock: true },
        { packageName: '1800 UC', priceMAD: 300, bonusCoins: 120, inStock: true, badge: 'Meilleure valeur' },
        { packageName: '3850 UC', priceMAD: 600, bonusCoins: 250, inStock: true },
        { packageName: '8100 UC', priceMAD: 1200, bonusCoins: 500, inStock: true, badge: 'VIP' },
      ],
    });

    const freeFire = await GamingProduct.create({
      name: 'Free Fire Diamonds',
      gameTitle: 'Free Fire',
      category: 'freefire',
      description: 'Rechargez vos Diamonds Free Fire pour acheter des skins, personnages et plus encore.',
      accountInputLabel: 'Votre UID Free Fire',
      accountInputPlaceholder: 'Ex: 1234567890',
      isAvailable: true,
      packages: [
        { packageName: '100 Diamonds', priceMAD: 15, bonusCoins: 5, inStock: true },
        { packageName: '310 Diamonds', priceMAD: 45, bonusCoins: 15, inStock: true, badge: 'Populaire' },
        { packageName: '520 Diamonds', priceMAD: 75, bonusCoins: 30, inStock: true },
        { packageName: '1060 Diamonds', priceMAD: 150, bonusCoins: 60, inStock: true, badge: 'Meilleure valeur' },
        { packageName: '2200 Diamonds', priceMAD: 300, bonusCoins: 120, inStock: true },
      ],
    });

    const roblox = await GamingProduct.create({
      name: 'Roblox Gift Card',
      gameTitle: 'Roblox',
      category: 'roblox',
      description: 'Cartes-cadeaux Roblox pour acheter des Robux et des abonnements Premium.',
      accountInputLabel: 'Email du compte Roblox',
      accountInputPlaceholder: 'email@exemple.com',
      isAvailable: true,
      packages: [
        { packageName: '400 Robux (10$)', priceMAD: 110, bonusCoins: 40, inStock: true },
        { packageName: '800 Robux (20$)', priceMAD: 220, bonusCoins: 80, inStock: true, badge: 'Populaire' },
        { packageName: '2000 Robux (50$)', priceMAD: 540, bonusCoins: 200, inStock: true, badge: 'Meilleure valeur' },
      ],
    });

    console.log('[SEED] Gaming products created');

    // ===== SAVING GOALS (for demo user) =====
    const goal1 = await SavingGoal.create({
      user: demo._id,
      name: 'Nouveau Smartphone',
      targetAmount: 3500,
      currentAmount: 1200,
      description: 'Économiser pour acheter le dernier iPhone',
      category: 'tech',
      icon: 'Smartphone',
      color: '#6366F1',
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: 'active',
    });

    const goal2 = await SavingGoal.create({
      user: demo._id,
      name: 'Voyage à Marrakech',
      targetAmount: 1500,
      currentAmount: 800,
      description: 'Weekend à la ville ocre avec la famille',
      category: 'travel',
      icon: 'Plane',
      color: '#F59E0B',
      targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: 'active',
    });

    const goal3 = await SavingGoal.create({
      user: demo._id,
      name: 'Console PS5',
      targetAmount: 5000,
      currentAmount: 5000,
      description: 'Mon objectif gaming atteint!',
      category: 'gaming',
      icon: 'Gamepad2',
      color: '#10B981',
      status: 'completed',
    });

    // ===== SAVING TRANSACTIONS =====
    const txDates = [30, 25, 20, 15, 12, 9, 7, 5, 3, 1].map(d => new Date(Date.now() - d * 24 * 60 * 60 * 1000));
    const txAmounts = [100, 50, 200, 50, 150, 20, 100, 50, 300, 180];
    for (let i = 0; i < txDates.length; i++) {
      await SavingTransaction.create({
        user: demo._id,
        goal: i < 6 ? goal1._id : goal2._id,
        amount: txAmounts[i],
        type: 'goal_deposit',
        note: `Épargne déclarée le ${txDates[i].toLocaleDateString('fr-MA')}`,
        disclaimerAcknowledged: true,
        declaredAt: txDates[i],
        createdAt: txDates[i],
      });
    }

    // ===== SAVING PLAN =====
    await SavingPlan.create({
      user: demo._id,
      title: 'Défi 5 DH par jour',
      description: 'Mettre de côté 5 DH chaque jour',
      targetFrequency: 'daily',
      targetAmountPerPeriod: 5,
      currentStreak: 12,
      totalSaved: 60,
      status: 'active',
      lastSavedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    });

    // ===== COIN TRANSACTIONS (for demo user) =====
    const coinTxs = [
      { amount: 50, type: 'welcome_bonus', description: 'Bonus de bienvenue FINI', refSuffix: 'WELCOME' },
      { amount: 300, type: 'earned_challenge', description: 'Défi d\'épargne hebdomadaire - 5 DH/jour', refSuffix: 'CHALLENGE1' },
      { amount: 500, type: 'earned_partner', description: 'Achat chez BIM (Simulation démo)', refSuffix: 'BIM1' },
      { amount: 200, type: 'earned_partner', description: 'Achat chez Marjane (Simulation démo)', refSuffix: 'MRJ1' },
      { amount: 25, type: 'order_reward', description: 'Bonus gaming PUBG 325 UC', refSuffix: 'GAME1' },
      { amount: -100, type: 'redeemed_coupon', description: 'Échange coupon BIM 10 DH', refSuffix: 'CPN1' },
      { amount: 150, type: 'earned_challenge', description: 'Défi mensuel d\'épargne', refSuffix: 'CHALLENGE2' },
      { amount: 125, type: 'earned_partner', description: 'Achat chez Kazyon (Simulation démo)', refSuffix: 'KAZ1' },
    ];

    let runningBalance = 0;
    for (const tx of coinTxs) {
      runningBalance += tx.amount;
      await CoinTransaction.create({
        user: demo._id,
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
        partner: tx.refSuffix.includes('BIM') ? bim._id : tx.refSuffix.includes('MRJ') ? marjane._id : undefined,
        referenceId: `SEED-${tx.refSuffix}-${demo._id}`,
        balanceAfter: Math.max(0, runningBalance),
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
    }

    // ===== GAMING ORDERS (for demo user) =====
    await GamingOrder.create({
      orderNumber: 'FINI-GAME-DEMO-001',
      user: demo._id,
      product: pubg._id,
      productName: 'PUBG Mobile UC',
      packageName: '325 UC',
      priceMAD: 60,
      coinsEarned: 25,
      playerIdOrAccount: '5132456789',
      paymentMethod: 'demo_payment',
      status: 'completed',
      isDemo: true,
    });

    await GamingOrder.create({
      orderNumber: 'FINI-GAME-DEMO-002',
      user: demo._id,
      product: freeFire._id,
      productName: 'Free Fire Diamonds',
      packageName: '310 Diamonds',
      priceMAD: 45,
      coinsEarned: 15,
      playerIdOrAccount: '1234567890',
      paymentMethod: 'demo_payment',
      status: 'completed',
      isDemo: true,
    });

    // ===== NOTIFICATIONS =====
    await Notification.insertMany([
      {
        user: demo._id,
        title: 'Bienvenue sur FINI! 🎉',
        message: 'Votre compte a été créé avec succès. Vous avez reçu 50 Coins de bienvenue!',
        type: 'welcome',
        isRead: true,
        iconType: 'Gift',
        link: '/dashboard',
      },
      {
        user: demo._id,
        title: 'Objectif d\'épargne en cours 🎯',
        message: 'Vous avez économisé 1 200 DH sur votre objectif "Nouveau Smartphone". Plus que 2 300 DH!',
        type: 'saving_goal_progress',
        isRead: false,
        iconType: 'Target',
        link: '/savings/goals',
      },
      {
        user: demo._id,
        title: 'Rappel d\'épargne 🔔',
        message: 'N\'oubliez pas votre épargne quotidienne de 5 DH. Gardez votre streak de 12 jours!',
        type: 'saving_reminder',
        isRead: false,
        iconType: 'Bell',
        link: '/savings/plans',
      },
      {
        user: demo._id,
        title: 'Coins gagnés! 🪙',
        message: 'Vous avez gagné 300 FINI Coins grâce à votre défi d\'épargne hebdomadaire.',
        type: 'coins_earned',
        isRead: false,
        iconType: 'Coins',
        link: '/coins',
      },
      {
        user: demo._id,
        title: 'Nouveau coupon disponible! 🎟️',
        message: 'Un nouveau coupon "15% chez Marjane" est disponible pour 200 Coins.',
        type: 'coupon_new',
        isRead: true,
        iconType: 'Tag',
        link: '/coupons',
      },
      {
        user: demo._id,
        title: 'Commande gaming effectuée! 🎮',
        message: 'Votre commande PUBG 325 UC a été confirmée. N° FINI-GAME-DEMO-001.',
        type: 'gaming_order_update',
        isRead: true,
        iconType: 'Gamepad2',
        link: '/gaming/orders',
      },
    ]);

    // Notifications for user2
    await Notification.create({
      user: user2._id,
      title: 'Bienvenue sur FINI! 🎉',
      message: 'Votre compte est prêt. Commencez à épargner et à gagner des récompenses!',
      type: 'welcome',
      isRead: false,
      iconType: 'Gift',
      link: '/dashboard',
    });

    console.log('[SEED] Notifications created');

    console.log('\n✅ Seed complete!\n');
    console.log('=== DEMO CREDENTIALS (DO NOT USE IN PRODUCTION) ===');
    console.log('Admin:  admin@fini.ma  / Admin2024!');
    console.log('User:   demo@fini.ma   / Demo2024!');
    console.log('User2:  fatima@fini.ma / Demo2024!');
    console.log('====================================================\n');
    console.log('NOTE: BIM, Marjane, Kazyon data is for DEMO ONLY.');
    console.log('      These are potential partners, NOT confirmed agreements.\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('[SEED ERROR]', err);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seed();
