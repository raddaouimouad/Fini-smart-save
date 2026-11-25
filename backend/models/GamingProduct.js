const mongoose = require('mongoose');

const packageOptionSchema = new mongoose.Schema({
  packageName: {
    type: String,
    required: true,
  },
  priceMAD: {
    type: Number,
    required: true,
  },
  bonusCoins: {
    type: Number,
    default: 0,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  badge: {
    type: String,
    default: '',
  },
});

const gamingProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du produit est requis'],
    trim: true,
  },
  gameTitle: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['pubg', 'freefire', 'giftcard', 'roblox', 'other'],
    required: true,
  },
  logo: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  accountInputLabel: {
    type: String,
    default: 'ID Joueur / UID',
  },
  accountInputPlaceholder: {
    type: String,
    default: 'Entrez votre ID Joueur',
  },
  packages: [packageOptionSchema],
}, {
  timestamps: true,
});

module.exports = mongoose.model('GamingProduct', gamingProductSchema);
