const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: [
      'saving_goal_progress',
      'saving_reminder',
      'coins_earned',
      'coupon_redeemed',
      'coupon_new',
      'coupon_expiring',
      'gaming_order_update',
      'partner_campaign',
      'welcome',
      'general',
    ],
    default: 'general',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  link: {
    type: String,
    default: '',
  },
  iconType: {
    type: String,
    default: 'Bell',
  },
}, {
  timestamps: true,
});

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
