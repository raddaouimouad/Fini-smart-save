const mongoose = require('mongoose');

const savingTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  goal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SavingGoal',
  },
  amount: {
    type: Number,
    required: [true, 'Le montant est requis'],
    min: [0.5, 'Le montant minimum est de 0.5 DH'],
  },
  type: {
    type: String,
    enum: ['manual_quick', 'goal_deposit', 'plan_deposit', 'goal_completion'],
    default: 'manual_quick',
  },
  note: {
    type: String,
    default: 'Épargne déclarée',
  },
  disclaimerAcknowledged: {
    type: Boolean,
    default: true,
  },
  declaredAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('SavingTransaction', savingTransactionSchema);
