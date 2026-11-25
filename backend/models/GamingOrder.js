const mongoose = require('mongoose');

const gamingOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GamingProduct',
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  packageName: {
    type: String,
    required: true,
  },
  priceMAD: {
    type: Number,
    required: true,
  },
  coinsEarned: {
    type: Number,
    default: 0,
  },
  playerIdOrAccount: {
    type: String,
    required: [true, "L'identifiant du joueur ou du compte est requis"],
  },
  paymentMethod: {
    type: String,
    enum: ['cash_plus', 'wafacash', 'orange_balance', 'cmi_card', 'demo_payment'],
    default: 'demo_payment',
  },
  status: {
    type: String,
    enum: ['pending', 'awaiting_payment', 'paid', 'processing', 'completed', 'failed', 'refunded'],
    default: 'paid',
  },
  deliveryNotes: {
    type: String,
    default: 'Livraison numérique instantanée simulée (Mode Démo)',
  },
  isDemo: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

gamingOrderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('GamingOrder', gamingOrderSchema);
