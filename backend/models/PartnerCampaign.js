const mongoose = require('mongoose');

const partnerCampaignSchema = new mongoose.Schema({
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  campaignType: {
    type: String,
    enum: ['earn_coins', 'redeem_coupon', 'double_coins'],
    default: 'earn_coins',
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'ended'],
    default: 'active',
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  totalCoinsBudget: {
    type: Number,
    required: true,
  },
  usedCoinsBudget: {
    type: Number,
    default: 0,
  },
  minPurchaseMAD: {
    type: Number,
    default: 0,
  },
  eligibleProducts: {
    type: [String],
    default: [],
  },
  maxRedemptionsTotal: {
    type: Number,
    default: 1000,
  },
  currentRedemptions: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('PartnerCampaign', partnerCampaignSchema);
