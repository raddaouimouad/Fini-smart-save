const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const User = require('../models/User');
const SavingGoal = require('../models/SavingGoal');
const SavingTransaction = require('../models/SavingTransaction');
const CoinTransaction = require('../models/CoinTransaction');
const Coupon = require('../models/Coupon');
const CouponRedemption = require('../models/CouponRedemption');
const GamingProduct = require('../models/GamingProduct');
const GamingOrder = require('../models/GamingOrder');
const Partner = require('../models/Partner');
const PartnerCampaign = require('../models/PartnerCampaign');
const PartnerBranch = require('../models/PartnerBranch');
const Notification = require('../models/Notification');
const AdminAuditLog = require('../models/AdminAuditLog');

const audit = async (req, action, targetType, targetId = null, details = {}) => {
  await AdminAuditLog.create({
    admin: req.user._id,
    action,
    targetType,
    targetId,
    details,
    ipAddress: req.ip,
  });
};

// ===== ANALYTICS =====
router.get('/analytics', protect, admin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalGoals,
      totalRedemptions,
      totalOrders,
      totalPartners,
      coinsTxs,
      savingTxSum,
      activeCoupons,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      SavingGoal.countDocuments(),
      CouponRedemption.countDocuments(),
      GamingOrder.countDocuments(),
      Partner.countDocuments({ status: 'active' }),
      CoinTransaction.aggregate([{ $group: { _id: null, issued: { $sum: { $cond: [{ $gt: ['$amount', 0] }, '$amount', 0] } } } }]),
      SavingTransaction.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Coupon.countDocuments({ isActive: true }),
    ]);

    const usersByMonth = await User.aggregate([
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 },
    ]);

    const coinsByMonth = await CoinTransaction.aggregate([
      { $match: { amount: { $gt: 0 } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, total: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalGoals,
        totalRedemptions,
        totalOrders,
        totalPartners,
        totalCoinsIssued: coinsTxs[0]?.issued || 0,
        totalDeclaredSavings: savingTxSum[0]?.total || 0,
        activeCoupons,
      },
      usersByMonth,
      coinsByMonth,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// ===== USERS MANAGEMENT =====
router.get('/users', protect, admin, async (req, res) => {
  try {
    const { search, role, page = 1, limit = 15 } = req.query;
    const filter = {};
    if (search) filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    if (role) filter.role = role;
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit));
    const total = await User.countDocuments(filter);
    res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.put('/users/:id/suspend', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Impossible de suspendre un admin.' });
    user.isSuspended = !user.isSuspended;
    await user.save();
    await audit(req, user.isSuspended ? 'suspend_user' : 'reactivate_user', 'user', user._id, { email: user.email });
    res.json({ success: true, message: user.isSuspended ? 'Compte suspendu.' : 'Compte réactivé.', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// ===== COUPONS MANAGEMENT =====
router.get('/coupons', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const coupons = await Coupon.find().populate('partner', 'name').sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit));
    const total = await Coupon.countDocuments();
    res.json({ success: true, coupons, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.post('/coupons', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    await audit(req, 'create_coupon', 'coupon', coupon._id, { title: coupon.title });
    res.status(201).json({ success: true, message: 'Coupon créé.', coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.put('/coupons/:id', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon introuvable.' });
    await audit(req, 'update_coupon', 'coupon', coupon._id, { title: coupon.title });
    res.json({ success: true, message: 'Coupon mis à jour.', coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.delete('/coupons/:id', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon introuvable.' });
    await audit(req, 'delete_coupon', 'coupon', coupon._id, { title: coupon.title });
    res.json({ success: true, message: 'Coupon supprimé.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// ===== GAMING PRODUCTS MANAGEMENT =====
router.get('/products', protect, admin, async (req, res) => {
  try {
    const products = await GamingProduct.find().sort({ name: 1 });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.post('/products', protect, admin, async (req, res) => {
  try {
    const product = await GamingProduct.create(req.body);
    await audit(req, 'create_product', 'product', product._id, { name: product.name });
    res.status(201).json({ success: true, message: 'Produit créé.', product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.put('/products/:id', protect, admin, async (req, res) => {
  try {
    const product = await GamingProduct.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    await audit(req, 'update_product', 'product', product._id, { name: product.name });
    res.json({ success: true, message: 'Produit mis à jour.', product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.delete('/products/:id', protect, admin, async (req, res) => {
  try {
    const product = await GamingProduct.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    await audit(req, 'delete_product', 'product', product._id);
    res.json({ success: true, message: 'Produit supprimé.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// ===== ORDERS MANAGEMENT =====
router.get('/orders', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const orders = await GamingOrder.find().populate('user', 'fullName email').populate('product', 'name')
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    const total = await GamingOrder.countDocuments();
    res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.put('/orders/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await GamingOrder.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    await audit(req, 'update_order_status', 'order', order._id, { status });
    res.json({ success: true, message: 'Statut mis à jour.', order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// ===== PARTNERS MANAGEMENT =====
router.get('/partners', protect, admin, async (req, res) => {
  try {
    const partners = await Partner.find().sort({ name: 1 });
    res.json({ success: true, partners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.post('/partners', protect, admin, async (req, res) => {
  try {
    const partner = await Partner.create(req.body);
    await audit(req, 'create_partner', 'partner', partner._id, { name: partner.name });
    res.status(201).json({ success: true, message: 'Partenaire créé.', partner });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.put('/partners/:id', protect, admin, async (req, res) => {
  try {
    const partner = await Partner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!partner) return res.status(404).json({ success: false, message: 'Partenaire introuvable.' });
    await audit(req, 'update_partner', 'partner', partner._id, { name: partner.name });
    res.json({ success: true, message: 'Partenaire mis à jour.', partner });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// ===== COINS MANAGEMENT =====
router.post('/coins/adjust', protect, admin, async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;
    if (!userId || !amount || !reason) {
      return res.status(400).json({ success: false, message: 'userId, amount et raison requis.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });

    const newBalance = user.coinsBalance + amount;
    if (newBalance < 0) return res.status(400).json({ success: false, message: 'Solde insuffisant après ajustement.' });

    user.coinsBalance = newBalance;
    await user.save();

    await CoinTransaction.create({
      user: userId,
      amount,
      type: 'admin_adjustment',
      description: `Ajustement admin: ${reason}`,
      referenceId: `ADJ-${Date.now()}-${userId}`,
      balanceAfter: newBalance,
    });

    await audit(req, 'admin_coins_adjustment', 'coins', userId, { amount, reason, newBalance });
    res.json({ success: true, message: 'Ajustement de Coins effectué.', newBalance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// ===== AUDIT LOG =====
router.get('/audit-log', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const logs = await AdminAuditLog.find().populate('admin', 'fullName email').sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit));
    const total = await AdminAuditLog.countDocuments();
    res.json({ success: true, logs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
