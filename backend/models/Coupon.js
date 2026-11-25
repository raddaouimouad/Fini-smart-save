const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre du coupon est requis'],
    trim: true,
  },
  code: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  merchantName: {
    type: String,
    required: [true, 'Le nom du marchand est requis'],
  },
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
  },
  category: {
    type: String,
    enum: ['supermarket', 'restaurant', 'gaming', 'shopping', 'special', 'welcome'],
    default: 'supermarket',
  },
  discountType: {
    type: String,
    enum: ['fixed_amount', 'percentage'],
    default: 'fixed_amount',
  },
  discountValue: {
    type: Number,
    required: true,
    min: 1,
  },
  requiredCoins: {
    type: Number,
    required: true,
    min: 0,
  },
  minPurchaseAmount: {
    type: Number,
    default: 0,
  },
  maxDiscountAmount: {
    type: Number,
    default: 0,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  termsAndConditions: {
    type: [String],
    default: ['Valable dans les magasins participants au Maroc', 'Un coupon par passage en caisse', 'Non remboursable en espèces'],
  },
  image: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  maxRedemptions: {
    type: Number,
    default: 500,
  },
  currentRedemptions: {
    type: Number,
    default: 0,
  },
  campaignBudgetCoins: {
    type: Number,
    default: 50000,
  },
  usedCoinsBudget: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Coupon', couponSchema);
