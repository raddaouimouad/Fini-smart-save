const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Partner = require('../models/Partner');
const PartnerBranch = require('../models/PartnerBranch');
const PartnerCampaign = require('../models/PartnerCampaign');
const Coupon = require('../models/Coupon');

// @route GET /api/partners
router.get('/', protect, async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { status: 'active' };
    if (category && category !== 'all') filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const partners = await Partner.find(filter).sort({ name: 1 });
    res.json({ success: true, partners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// @route GET /api/partners/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) return res.status(404).json({ success: false, message: 'Partenaire introuvable.' });

    const [branches, campaigns, coupons] = await Promise.all([
      PartnerBranch.find({ partner: partner._id }),
      PartnerCampaign.find({ partner: partner._id, status: 'active', endDate: { $gte: new Date() } }),
      Coupon.find({ partner: partner._id, isActive: true, expirationDate: { $gte: new Date() } }).limit(5),
    ]);

    res.json({ success: true, partner, branches, campaigns, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
