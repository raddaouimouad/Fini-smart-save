const mongoose = require('mongoose');

const partnerBranchSchema = new mongoose.Schema({
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    default: 33.5731,
  },
  longitude: {
    type: Number,
    default: -7.5898,
  },
  phone: {
    type: String,
    default: '+212 522 00 00 00',
  },
  openingHours: {
    type: String,
    default: '09:00 - 21:00 (7j/7)',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('PartnerBranch', partnerBranchSchema);
