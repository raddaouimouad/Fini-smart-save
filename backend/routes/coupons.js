const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Coupon = require('../models/Coupon');
const CouponRedemption = require('../models/CouponRedemption');
const CoinTransaction = require('../models/CoinTransaction');
const Notification = require('../models/Notification');
const User = require('../models/User');
const crypto = require('crypto');

// @route GET /api/coupons
router.get('/', protect, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true, expirationDate: { $gte: new Date() } };
    if (category && category !== 'all') filter.category = category;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const coupons = await Coupon.find(filter)
      .populate('partner', 'name logo')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Coupon.countDocuments(filter);

    res.json({ success: true, coupons, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// @route GET /api/coupons/my-coupons
router.get('/my-coupons', protect, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const redemptions = await CouponRedemption.find(filter)
      .populate('coupon', 'title merchantName discountType discountValue minPurchaseAmount termsAndConditions image')
      .sort({ redeemedAt: -1 });

    // Auto-expire
    const now = new Date();
    for (const r of redemptions) {
      if (r.status === 'active' && r.expiresAt < now) {
        r.status = 'expired';
        await r.save();
      }
    }

    res.json({ success: true, redemptions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// @route GET /api/coupons/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id).populate('partner', 'name logo description cities');
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon introuvable.' });
    res.json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// @route POST /api/coupons/redeem/:id
router.post('/redeem/:id', protect, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon introuvable.' });

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: 'Ce coupon est inactif.' });
    }
    if (coupon.expirationDate < new Date()) {
      return res.status(400).json({ success: false, message: 'Ce coupon est expiré.' });
    }
    if (coupon.currentRedemptions >= coupon.maxRedemptions) {
      return res.status(400).json({ success: false, message: 'Ce coupon a atteint sa limite de remboursements.' });
    }

    const user = await User.findById(req.user._id);
    if (user.coinsBalance < coupon.requiredCoins) {
      return res.status(400).json({ success: false, message: `Vous avez besoin de ${coupon.requiredCoins} Coins. Votre solde: ${user.coinsBalance} Coins.` });
    }

    const existingActive = await CouponRedemption.findOne({
      user: req.user._id,
      coupon: coupon._id,
      status: 'active',
    });
    if (existingActive) {
      return res.status(400).json({ success: false, message: 'Vous avez déjà un coupon actif pour ce marchand.' });
    }

    const uniqueCode = `FINI-${coupon.merchantName.substring(0, 3).toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const newBalance = user.coinsBalance - coupon.requiredCoins;
    user.coinsBalance = newBalance;
    await user.save();

    const redemption = await CouponRedemption.create({
      user: req.user._id,
      coupon: coupon._id,
      coinsSpent: coupon.requiredCoins,
      uniqueCode,
      qrCodeData: JSON.stringify({ code: uniqueCode, couponId: coupon._id, userId: req.user._id, merchant: coupon.merchantName }),
      expiresAt,
    });

    coupon.currentRedemptions += 1;
    coupon.usedCoinsBudget += coupon.requiredCoins;
    await coupon.save();

    await CoinTransaction.create({
      user: req.user._id,
      amount: -coupon.requiredCoins,
      type: 'redeemed_coupon',
      description: `Échange pour coupon ${coupon.title} - ${coupon.merchantName}`,
      coupon: coupon._id,
      referenceId: `COUPON-${redemption._id}`,
      balanceAfter: newBalance,
    });

    await Notification.create({
      user: req.user._id,
      title: 'Coupon obtenu! 🎟️',
      message: `Votre coupon "${coupon.title}" est prêt. Code: ${uniqueCode}. Valable 7 jours.`,
      type: 'coupon_redeemed',
      link: '/coupons/my-coupons',
    });

    res.status(201).json({
      success: true,
      message: 'Coupon échangé avec succès!',
      redemption,
      newCoinsBalance: newBalance,
    });
  } catch (error) {
    console.error('[COUPONS] Redeem error:', error.message);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
