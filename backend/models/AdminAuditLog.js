const mongoose = require('mongoose');

const adminAuditLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  targetType: {
    type: String,
    enum: ['user', 'coupon', 'partner', 'product', 'order', 'campaign', 'coins', 'system'],
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  ipAddress: {
    type: String,
    default: 'unknown',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('AdminAuditLog', adminAuditLogSchema);
