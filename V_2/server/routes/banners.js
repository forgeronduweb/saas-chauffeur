const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const { requireAuth } = require('../middleware/auth');

// GET all banners (public)
router.get('/', async (req, res) => {
  try {
    const { location, active } = req.query;
    const filter = {};
    
    if (location) filter.location = location;
    if (active === 'true') filter.isActive = true;
    
    const banners = await Banner.find(filter).sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single banner
router.get('/:id', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Bannière non trouvée' });
    }
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create banner (admin only)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, image, link, order, isActive, location } = req.body;
    
    const banner = new Banner({
      title,
      image,
      link,
      order: order || 0,
      isActive: isActive !== false,
      location: location || 'home'
    });
    
    const savedBanner = await banner.save();
    res.status(201).json(savedBanner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update banner (admin only)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { title, image, link, order, isActive, location } = req.body;
    
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      { title, image, link, order, isActive, location },
      { new: true }
    );
    
    if (!banner) {
      return res.status(404).json({ message: 'Bannière non trouvée' });
    }
    
    res.json(banner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE banner (admin only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ message: 'Bannière non trouvée' });
    }
    
    res.json({ message: 'Bannière supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT reorder banners (admin only)
router.put('/reorder/all', requireAuth, async (req, res) => {
  try {
    const { banners } = req.body;
    
    for (let i = 0; i < banners.length; i++) {
      await Banner.findByIdAndUpdate(banners[i]._id, { order: i });
    }
    
    res.json({ message: 'Ordre mis à jour' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
