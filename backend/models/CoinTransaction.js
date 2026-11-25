const mongoose = require('mongoose');

const coinTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: [
      'earned_partner',
      'earned_challenge',
      'redeemed_coupon',
      'admin_adjustment',
      'welcome_bonus',
      'order_reward'
    ],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
  },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PartnerCampaign',
  },
  referenceId: {
    type: String,
    unique: true,
    required: true,
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

coinTransactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('CoinTransaction', coinTransactionSchema);
