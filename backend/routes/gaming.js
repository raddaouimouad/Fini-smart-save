const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const GamingProduct = require('../models/GamingProduct');
const GamingOrder = require('../models/GamingOrder');
const User = require('../models/User');
const CoinTransaction = require('../models/CoinTransaction');
const Notification = require('../models/Notification');
const crypto = require('crypto');

// @route GET /api/gaming/products
router.get('/products', protect, async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { isAvailable: true };
    if (category && category !== 'all') filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const products = await GamingProduct.find(filter).sort({ name: 1 });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// @route GET /api/gaming/products/:id
router.get('/products/:id', protect, async (req, res) => {
  try {
    const product = await GamingProduct.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// @route POST /api/gaming/orders
router.post('/orders', protect, async (req, res) => {
  try {
    const { productId, packageName, playerIdOrAccount, paymentMethod } = req.body;

    if (!productId || !packageName || !playerIdOrAccount) {
      return res.status(400).json({ success: false, message: 'Produit, package et ID joueur requis.' });
    }

    const product = await GamingProduct.findById(productId);
    if (!product || !product.isAvailable) {
      return res.status(404).json({ success: false, message: 'Produit indisponible.' });
    }

    const selectedPackage = product.packages.find((p) => p.packageName === packageName);
    if (!selectedPackage) {
      return res.status(400).json({ success: false, message: 'Package introuvable.' });
    }
    if (!selectedPackage.inStock) {
      return res.status(400).json({ success: false, message: 'Ce package est en rupture de stock.' });
    }

    const orderNumber = `FINI-GAME-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    const order = await GamingOrder.create({
      orderNumber,
      user: req.user._id,
      product: product._id,
      productName: product.name,
      packageName,
      priceMAD: selectedPackage.priceMAD,
      coinsEarned: selectedPackage.bonusCoins || 0,
      playerIdOrAccount,
      paymentMethod: paymentMethod || 'demo_payment',
      status: 'completed',
      isDemo: true,
    });

    if (selectedPackage.bonusCoins > 0) {
      const user = await User.findById(req.user._id);
      user.coinsBalance += selectedPackage.bonusCoins;
      await user.save();

      await CoinTransaction.create({
        user: req.user._id,
        amount: selectedPackage.bonusCoins,
        type: 'order_reward',
        description: `Bonus Coins pour achat ${product.name} - ${packageName}`,
        referenceId: `ORDER-${order._id}`,
        balanceAfter: user.coinsBalance,
      });
    }

    await Notification.create({
      user: req.user._id,
      title: 'Commande effectuée! 🎮',
      message: `Votre commande ${product.name} - ${packageName} a été traitée (Mode Démo). N° ${orderNumber}.`,
      type: 'gaming_order_update',
      link: '/gaming/orders',
    });

    res.status(201).json({
      success: true,
      message: `Commande créée (Mode Démo). N° ${orderNumber}`,
      order: await order.populate('product', 'name category'),
    });
  } catch (error) {
    console.error('[GAMING] Order error:', error.message);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// @route GET /api/gaming/orders
router.get('/orders', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const orders = await GamingOrder.find({ user: req.user._id })
      .populate('product', 'name logo category')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await GamingOrder.countDocuments({ user: req.user._id });
    res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
