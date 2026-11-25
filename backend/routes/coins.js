const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const CoinTransaction = require('../models/CoinTransaction');

// @route GET /api/coins
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('coinsBalance fullName');
    const { page = 1, limit = 20, type } = req.query;
    const filter = { user: req.user._id };
    if (type) filter.type = type;

    const transactions = await CoinTransaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('partner', 'name logo')
      .populate('coupon', 'title merchantName');

    const total = await CoinTransaction.countDocuments(filter);

    // Stats
    const earningsAgg = await CoinTransaction.aggregate([
      { $match: { user: req.user._id, amount: { $gt: 0 } } },
      { $group: { _id: null, totalEarned: { $sum: '$amount' } } },
    ]);
    const spendingsAgg = await CoinTransaction.aggregate([
      { $match: { user: req.user._id, amount: { $lt: 0 } } },
      { $group: { _id: null, totalSpent: { $sum: '$amount' } } },
    ]);

    res.json({
      success: true,
      balance: user.coinsBalance,
      stats: {
        totalEarned: earningsAgg[0]?.totalEarned || 0,
        totalSpent: Math.abs(spendingsAgg[0]?.totalSpent || 0),
      },
      transactions,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
