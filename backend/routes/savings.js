const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const SavingGoal = require('../models/SavingGoal');
const SavingTransaction = require('../models/SavingTransaction');
const SavingPlan = require('../models/SavingPlan');
const Notification = require('../models/Notification');
const User = require('../models/User');
const CoinTransaction = require('../models/CoinTransaction');

// === SAVING GOALS ===

// @route GET /api/savings/goals
router.get('/goals', protect, async (req, res) => {
  try {
    const goals = await SavingGoal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, goals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// @route POST /api/savings/goals
router.post('/goals', protect, async (req, res) => {
  try {
    const { name, targetAmount, targetDate, description, category, icon, color } = req.body;
    if (!name || !targetAmount) {
      return res.status(400).json({ success: false, message: 'Nom et montant cible requis.' });
    }
    if (targetAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Le montant cible doit être positif.' });
    }
    const goal = await SavingGoal.create({
      user: req.user._id,
      name: name.trim(),
      targetAmount,
      targetDate,
      description,
      category: category || 'other',
      icon: icon || 'Target',
      color: color || '#10B981',
    });

    await Notification.create({
      user: req.user._id,
      title: 'Objectif d\'épargne créé! 🎯',
      message: `Votre objectif "${name}" de ${targetAmount} DH a été créé. Bonne chance!`,
      type: 'saving_goal_progress',
      link: '/savings/goals',
    });

    res.status(201).json({ success: true, message: 'Objectif créé!', goal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// @route PUT /api/savings/goals/:id
router.put('/goals/:id', protect, async (req, res) => {
  try {
    const goal = await SavingGoal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Objectif introuvable.' });

    const { name, targetAmount, targetDate, description, status } = req.body;
    if (name) goal.name = name.trim();
    if (targetAmount) goal.targetAmount = targetAmount;
    if (targetDate !== undefined) goal.targetDate = targetDate;
    if (description !== undefined) goal.description = description;
    if (status) goal.status = status;

    await goal.save();
    res.json({ success: true, message: 'Objectif mis à jour.', goal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// @route DELETE /api/savings/goals/:id
router.delete('/goals/:id', protect, async (req, res) => {
  try {
    const goal = await SavingGoal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Objectif introuvable.' });
    res.json({ success: true, message: 'Objectif supprimé.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// @route GET /api/savings/transactions
router.get('/transactions', protect, async (req, res) => {
  try {
    const { goalId, page = 1, limit = 20 } = req.query;
    const filter = { user: req.user._id };
    if (goalId) filter.goal = goalId;

    const transactions = await SavingTransaction.find(filter)
      .populate('goal', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await SavingTransaction.countDocuments(filter);

    res.json({ success: true, transactions, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// @route POST /api/savings/quick-save
router.post('/quick-save', protect, async (req, res) => {
  try {
    const { amount, goalId, note, disclaimerAcknowledged } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Montant invalide.' });
    }

    if (!disclaimerAcknowledged) {
      return res.status(400).json({ success: false, message: 'Veuillez confirmer que vous avez bien mis de côté ce montant.' });
    }

    if (goalId) {
      const goal = await SavingGoal.findOne({ _id: goalId, user: req.user._id });
      if (!goal) return res.status(404).json({ success: false, message: 'Objectif introuvable.' });

      goal.currentAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
      if (goal.currentAmount >= goal.targetAmount) {
        goal.status = 'completed';
        await Notification.create({
          user: req.user._id,
          title: 'Objectif atteint! 🏆',
          message: `Félicitations! Vous avez atteint votre objectif "${goal.name}" de ${goal.targetAmount} DH!`,
          type: 'saving_goal_progress',
          link: '/savings/goals',
        });
      }
      await goal.save();

      const tx = await SavingTransaction.create({
        user: req.user._id,
        goal: goalId,
        amount,
        type: 'goal_deposit',
        note: note || `Épargne sur objectif "${goal.name}"`,
        disclaimerAcknowledged: true,
      });

      return res.status(201).json({ success: true, message: `${amount} DH enregistré sur votre objectif.`, transaction: tx, goal });
    }

    const tx = await SavingTransaction.create({
      user: req.user._id,
      amount,
      type: 'manual_quick',
      note: note || 'Épargne rapide déclarée',
      disclaimerAcknowledged: true,
    });

    res.status(201).json({ success: true, message: `${amount} DH enregistré avec succès.`, transaction: tx });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// === SAVING PLANS ===

// @route GET /api/savings/plans
router.get('/plans', protect, async (req, res) => {
  try {
    const plans = await SavingPlan.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// @route POST /api/savings/plans
router.post('/plans', protect, async (req, res) => {
  try {
    const { title, description, targetFrequency, targetAmountPerPeriod } = req.body;
    if (!title || !targetFrequency || !targetAmountPerPeriod) {
      return res.status(400).json({ success: false, message: 'Titre, fréquence et montant requis.' });
    }

    const existingActivePlan = await SavingPlan.findOne({ user: req.user._id, status: 'active' });
    if (existingActivePlan) {
      return res.status(400).json({ success: false, message: 'Vous avez déjà un plan actif. Mettez-le en pause d\'abord.' });
    }

    const plan = await SavingPlan.create({
      user: req.user._id,
      title,
      description,
      targetFrequency,
      targetAmountPerPeriod,
    });
    res.status(201).json({ success: true, message: 'Plan d\'épargne créé!', plan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// @route PUT /api/savings/plans/:id
router.put('/plans/:id', protect, async (req, res) => {
  try {
    const plan = await SavingPlan.findOne({ _id: req.params.id, user: req.user._id });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan introuvable.' });

    const { status, amount } = req.body;

    if (status) plan.status = status;
    if (amount !== undefined && amount > 0) {
      plan.totalSaved += amount;
      plan.currentStreak += 1;
      plan.lastSavedAt = new Date();

      await SavingTransaction.create({
        user: req.user._id,
        amount,
        type: 'plan_deposit',
        note: `Plan d'épargne: ${plan.title}`,
        disclaimerAcknowledged: true,
      });
    }

    await plan.save();
    res.json({ success: true, message: 'Plan mis à jour.', plan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
