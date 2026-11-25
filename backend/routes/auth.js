const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const Notification = require('../models/Notification');
const CoinTransaction = require('../models/CoinTransaction');
const { generateToken } = require('../middleware/auth');
const { protect } = require('../middleware/auth');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Trop de tentatives. Veuillez réessayer dans 15 minutes.' }
});

// @route   POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, confirmPassword } = req.body;

    if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Tous les champs sont obligatoires.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Les mots de passe ne correspondent pas.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    const marPhoneRegex = /^(\+212|0)([ \-]?)([5-7]\d{8})$/;
    if (!marPhoneRegex.test(phoneNumber)) {
      return res.status(400).json({ success: false, message: 'Numéro de téléphone marocain invalide.' });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Cette adresse email est déjà utilisée.' });
    }

    const existingPhone = await User.findOne({ phoneNumber });
    if (existingPhone) {
      return res.status(400).json({ success: false, message: 'Ce numéro de téléphone est déjà utilisé.' });
    }

    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber,
      password,
      coinsBalance: 50,
    });

    // Welcome notification
    await Notification.create({
      user: user._id,
      title: 'Bienvenue sur FINI! 🎉',
      message: `Bonjour ${user.fullName}! Votre compte a été créé avec succès. Vous avez reçu 50 FINI Coins de bienvenue. Commencez à épargner et à gagner des récompenses dès aujourd'hui!`,
      type: 'welcome',
      iconType: 'Gift',
      link: '/dashboard',
    });

    // Record initial coins
    await CoinTransaction.create({
      user: user._id,
      amount: 50,
      type: 'welcome_bonus',
      description: 'Bonus de bienvenue FINI',
      referenceId: `WELCOME-${user._id}`,
      balanceAfter: 50,
    });

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès!',
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        coinsBalance: user.coinsBalance,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[AUTH] Register error:', error.message);
    res.status(500).json({ success: false, message: 'Erreur serveur. Veuillez réessayer.' });
  }
});

// @route   POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ success: false, message: 'Compte suspendu. Contactez le support.' });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Connexion réussie!',
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        coinsBalance: user.coinsBalance,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[AUTH] Login error:', error.message);
    res.status(500).json({ success: false, message: 'Erreur serveur. Veuillez réessayer.' });
  }
});

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// @route   PUT /api/auth/update-profile
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { fullName, phoneNumber, city, language } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });

    if (fullName) user.fullName = fullName.trim();
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (city) user.city = city;
    if (language) user.language = language;

    await user.save();
    res.json({ success: true, message: 'Profil mis à jour.', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// @route   PUT /api/auth/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Tous les champs sont requis.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mot de passe actuel incorrect.' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Mot de passe modifié avec succès.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
