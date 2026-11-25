const mongoose = require('mongoose');

const couponRedemptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    required: true,
  },
  coinsSpent: {
    type: Number,
    required: true,
  },
  uniqueCode: {
    type: String,
    required: true,
    unique: true,
  },
  qrCodeData: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'used', 'expired'],
    default: 'active',
  },
  redeemedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  usedAt: {
    type: Date,
  },
  usedAtBranch: {
    type: String,
  },
}, {
  timestamps: true,
});

couponRedemptionSchema.index({ user: 1, coupon: 1 });

module.exports = mongoose.model('CouponRedemption', couponRedemptionSchema);
