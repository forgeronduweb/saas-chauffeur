const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { requireAuth } = require('../middleware/auth');

// Route publique pour les statistiques générales
router.get('/public', statsController.getPublicStats);

// Routes protégées pour les statistiques utilisateur
router.get('/employer', requireAuth, statsController.getEmployerStats);
router.get('/driver', requireAuth, statsController.getDriverStats);

module.exports = router;
