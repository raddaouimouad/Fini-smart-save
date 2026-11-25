const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const SavingGoal = require('../models/SavingGoal');
const SavingTransaction = require('../models/SavingTransaction');
const SavingPlan = require('../models/SavingPlan');
const CoinTransaction = require('../models/CoinTransaction');
const Coupon = require('../models/Coupon');
const CouponRedemption = require('../models/CouponRedemption');
const GamingOrder = require('../models/GamingOrder');
const Notification = require('../models/Notification');
const Partner = require('../models/Partner');
const PartnerCampaign = require('../models/PartnerCampaign');
const User = require('../models/User');

// @route GET /api/dashboard
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const [
      goalsData,
      savingTxs,
      unreadNotifications,
      activeCoupons,
      recentCoinTxs,
      recentGoals,
      recentNotifs,
      activePartners,
      activeCampaigns,
      recentOrders,
    ] = await Promise.all([
      SavingGoal.find({ user: userId }),
      SavingTransaction.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Notification.countDocuments({ user: userId, isRead: false }),
      CouponRedemption.countDocuments({ user: userId, status: 'active' }),
      CoinTransaction.find({ user: userId }).sort({ createdAt: -1 }).limit(5),
      SavingGoal.find({ user: userId, status: 'active' }).sort({ createdAt: -1 }).limit(3),
      Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(5),
      Partner.find({ status: 'active' }).limit(4),
      PartnerCampaign.find({ status: 'active', endDate: { $gte: new Date() } }).limit(3),
      GamingOrder.find({ user: userId }).sort({ createdAt: -1 }).limit(3).populate('product', 'name'),
    ]);

    const totalSavings = savingTxs[0]?.total || 0;
    const activeGoals = goalsData.filter((g) => g.status === 'active').length;

    res.json({
      success: true,
      data: {
        user: {
          fullName: req.user.fullName,
          coinsBalance: req.user.coinsBalance,
          avatar: req.user.avatar,
        },
        stats: {
          totalDeclaredSavings: totalSavings,
          activeGoals,
          coinsBalance: req.user.coinsBalance,
          activeCoupons,
          unreadNotifications,
        },
        recentGoals,
        recentCoinTransactions: recentCoinTxs,
        recentNotifications: recentNotifs,
        featuredPartners: activePartners,
        activeCampaigns,
        recentOrders,
      },
    });
  } catch (error) {
    console.error('[DASHBOARD] Error:', error.message);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement du tableau de bord.' });
  }
});

module.exports = router;
