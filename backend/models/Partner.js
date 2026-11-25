const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du partenaire est requis'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  logo: {
    type: String,
    default: '',
  },
  coverImage: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['supermarket', 'retail', 'food', 'gaming', 'electronics', 'fashion'],
    default: 'supermarket',
  },
  description: {
    type: String,
    default: '',
  },
  website: {
    type: String,
    default: '',
  },
  isVerifiedPartner: {
    type: Boolean,
    default: false,
    // Note: BIM, Marjane, Kazyon are potential partners, not confirmed commercial agreements.
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'inactive'],
    default: 'active',
  },
  cities: {
    type: [String],
    default: ['Casablanca', 'Rabat', 'Marrakech', 'Tanger'],
  },
  earningRateDescription: {
    type: String,
    default: "1 FINI Coin pour chaque 10 DH d'achat vérifié",
  },
  coinsPerMAD: {
    type: Number,
    default: 0.1, // 1 coin per 10 MAD
  },
  activeCampaignCount: {
    type: Number,
    default: 1,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Partner', partnerSchema);
