const mongoose = require('mongoose');

const savingGoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Le nom de l’objectif est requis'],
    trim: true,
  },
  targetAmount: {
    type: Number,
    required: [true, 'Le montant cible en DH est requis'],
    min: [1, 'Le montant doit être supérieur à 0'],
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  targetDate: {
    type: Date,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['tech', 'travel', 'gaming', 'eid', 'emergency', 'shopping', 'other'],
    default: 'other',
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active',
  },
  icon: {
    type: String,
    default: 'Target',
  },
  color: {
    type: String,
    default: '#10B981',
  },
}, {
  timestamps: true,
});

savingGoalSchema.virtual('progressPercentage').get(function () {
  if (!this.targetAmount || this.targetAmount === 0) return 0;
  return Math.min(100, Math.round((this.currentAmount / this.targetAmount) * 100));
});

savingGoalSchema.virtual('remainingAmount').get(function () {
  return Math.max(0, this.targetAmount - this.currentAmount);
});

savingGoalSchema.set('toJSON', { virtuals: true });
savingGoalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SavingGoal', savingGoalSchema);
