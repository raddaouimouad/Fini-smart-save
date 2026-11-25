const mongoose = require('mongoose');

const savingPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Le titre du plan est requis'],
  },
  description: {
    type: String,
    default: '',
  },
  targetFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily',
  },
  targetAmountPerPeriod: {
    type: Number,
    required: true,
    min: 1,
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  totalSaved: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed'],
    default: 'active',
  },
  lastSavedAt: {
    type: Date,
  },
  badge: {
    type: String,
    default: 'Épargnant Actif',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('SavingPlan', savingPlanSchema);
